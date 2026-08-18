import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics() {
    const studentCount = await this.prisma.user.count({ where: { role: 'STUDENT' } });
    const examsCount = await this.prisma.exam.count();
    const questionsCount = await this.prisma.question.count();
    const notesCount = await this.prisma.note.count();
    const mockTestsCount = await this.prisma.mockTest.count();
    const attemptsCount = await this.prisma.testAttempt.count();
    
    // Revenue calculations: sum amount of PAID payments
    const payments = await this.prisma.payment.findMany({
      where: { status: 'PAID' },
      select: { amount: true },
    });
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    // Dynamic stats: mock tests count over time, recent user actions
    const recentAttempts = await this.prisma.testAttempt.findMany({
      take: 5,
      orderBy: { completedAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        mockTest: { select: { title: true } },
      },
    });

    const recentPayments = await this.prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    // Subject/Exam popularity based on test attempts
    const attempts = await this.prisma.testAttempt.findMany({
      include: {
        mockTest: {
          select: { title: true },
        },
      },
    });
    
    const popularity: Record<string, number> = {};
    for (const a of attempts) {
      const name = a.mockTest.title;
      popularity[name] = (popularity[name] || 0) + 1;
    }
    
    const popularTests = Object.entries(popularity)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Mock timeline for revenue charts
    const monthlyRevenue = [
      { name: 'Jan', amount: totalRevenue * 0.15 },
      { name: 'Feb', amount: totalRevenue * 0.18 },
      { name: 'Mar', amount: totalRevenue * 0.22 },
      { name: 'Apr', amount: totalRevenue * 0.25 },
      { name: 'May', amount: totalRevenue * 0.35 },
      { name: 'Jun', amount: totalRevenue * 0.40 },
    ];

    // Mock timeline for active users
    const dailyActiveUsers = [
      { date: 'Mon', count: 120 },
      { date: 'Tue', count: 150 },
      { date: 'Wed', count: 180 },
      { date: 'Thu', count: 210 },
      { date: 'Fri', count: 190 },
      { date: 'Sat', count: 240 },
      { date: 'Sun', count: 270 },
    ];

    return {
      overview: {
        studentCount,
        examsCount,
        questionsCount,
        notesCount,
        mockTestsCount,
        attemptsCount,
        totalRevenue,
      },
      popularTests,
      recentAttempts,
      recentPayments,
      charts: {
        monthlyRevenue,
        dailyActiveUsers,
      },
      serverHealth: {
        status: 'Healthy',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
    };
  }
}
