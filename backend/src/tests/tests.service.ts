import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  async checkAccess(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE',
            endDate: { gte: new Date() },
          },
        },
      },
    });

    if (!user) return false;
    const isTrialActive = new Date(user.trialEndDate) > new Date();
    if (isTrialActive) return true;
    if (user.subscriptions.length > 0) return true;

    return false;
  }

  async findTestsByExam(examId: string) {
    return this.prisma.mockTest.findMany({
      where: { examId },
      include: {
        _count: { select: { questions: true } },
      },
    });
  }

  async findTestById(id: string, userId: string) {
    const test = await this.prisma.mockTest.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            question: true,
          },
        },
      },
    });

    if (!test) throw new NotFoundException('Mock test not found');

    if (test.isPremium) {
      const hasAccess = await this.checkAccess(userId);
      if (!hasAccess) {
        throw new ForbiddenException('Premium content locked. Subscription required.');
      }
    }

    return test;
  }

  async submitTest(userId: string, testId: string, data: { answers: Record<string, number>; timeTakenSeconds: number }) {
    const test = await this.prisma.mockTest.findUnique({
      where: { id: testId },
      include: {
        questions: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!test) throw new NotFoundException('Mock test not found');

    let correctCount = 0;
    let incorrectCount = 0;
    const questionsList = test.questions.map((q) => q.question);
    
    // Weight per question = TotalMarks / Number of Questions
    const weightPerQuestion = test.questions.length > 0 ? (test.totalMarks / test.questions.length) : 0;
    
    for (const q of questionsList) {
      const selectedOption = data.answers[q.id];
      if (selectedOption !== undefined && selectedOption !== null) {
        if (selectedOption === q.correctOption) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      }
    }

    // Calculate score: correct * weight - incorrect * weight * negativeMarking
    const positiveMarks = correctCount * weightPerQuestion;
    const negativeMarks = incorrectCount * weightPerQuestion * test.negativeMarking;
    const rawScore = positiveMarks - negativeMarks;
    const finalScore = parseFloat(Math.max(0, rawScore).toFixed(2));

    // Save test attempt
    const attempt = await this.prisma.testAttempt.create({
      data: {
        userId,
        mockTestId: testId,
        score: finalScore,
        correctCount,
        incorrectCount,
        answers: JSON.stringify(data.answers),
        timeTakenSeconds: data.timeTakenSeconds,
      },
    });

    // Award XP (50 XP for completing a test + 10 XP per correct answer)
    const earnedXP = 50 + correctCount * 10;
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xpPoints: { increment: earnedXP },
        coins: { increment: 15 }, // Completing a test rewards 15 coins
      },
    });

    // Calculate Rank and Percentile
    const allAttempts = await this.prisma.testAttempt.findMany({
      where: { mockTestId: testId },
      orderBy: { score: 'desc' },
    });

    const rank = allAttempts.findIndex((a) => a.id === attempt.id) + 1;
    const totalAttempts = allAttempts.length;
    // Percentile = ((Total - Rank) / Total) * 100
    const percentile = totalAttempts > 1 
      ? parseFloat((((totalAttempts - rank) / (totalAttempts - 1)) * 100).toFixed(1)) 
      : 100.0;

    // Subject/Topic breakdown analysis
    const topicBreakdown: Record<string, { topicName: string; correct: number; total: number }> = {};
    for (const mq of test.questions) {
      const q = mq.question;
      const topicId = q.topicId;
      
      // Load topic name (if not loaded, look it up or query topic details)
      if (!topicBreakdown[topicId]) {
        const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
        topicBreakdown[topicId] = {
          topicName: topic ? topic.name : 'Unknown Topic',
          correct: 0,
          total: 0,
        };
      }

      topicBreakdown[topicId].total++;
      const selected = data.answers[q.id];
      if (selected !== undefined && selected === q.correctOption) {
        topicBreakdown[topicId].correct++;
      }
    }

    return {
      attemptId: attempt.id,
      score: finalScore,
      totalMarks: test.totalMarks,
      correctCount,
      incorrectCount,
      timeTakenSeconds: data.timeTakenSeconds,
      rank,
      percentile,
      totalAttempts,
      topicBreakdown: Object.values(topicBreakdown),
    };
  }

  async getAttemptHistory(userId: string) {
    return this.prisma.testAttempt.findMany({
      where: { userId },
      include: {
        mockTest: {
          select: { title: true, totalMarks: true },
        },
      },
      orderBy: { completedAt: 'desc' },
    });
  }

  // Admin APIs
  async createTest(data: {
    title: string;
    description: string;
    durationMinutes: number;
    totalMarks: number;
    negativeMarking?: number;
    isPremium?: boolean;
    examId: string;
    questionIds?: string[];
  }) {
    const { questionIds, ...rest } = data;
    const test = await this.prisma.mockTest.create({
      data: {
        ...rest,
        negativeMarking: data.negativeMarking ?? 0.25,
        isPremium: data.isPremium || false,
      },
    });

    if (questionIds && questionIds.length > 0) {
      const links = questionIds.map((qId, idx) => ({
        mockTestId: test.id,
        questionId: qId,
        order: idx + 1,
      }));
      await this.prisma.mockTestQuestion.createMany({ data: links });
    }

    return this.prisma.mockTest.findUnique({
      where: { id: test.id },
      include: { questions: true },
    });
  }

  async deleteTest(id: string) {
    return this.prisma.mockTest.delete({ where: { id } });
  }
}
