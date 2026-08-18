import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async findAllExams() {
    return this.prisma.exam.findMany({
      include: {
        _count: {
          select: { subjects: true, mockTests: true },
        },
      },
    });
  }

  async findExamById(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            chapters: {
              include: {
                topics: true,
              },
            },
          },
        },
      },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async findSubjectsByExam(examId: string) {
    return this.prisma.subject.findMany({
      where: { examId },
      include: {
        _count: {
          select: { chapters: true },
        },
      },
    });
  }

  async findChaptersBySubject(subjectId: string) {
    return this.prisma.chapter.findMany({
      where: { subjectId },
      include: {
        _count: {
          select: { topics: true },
        },
      },
    });
  }

  async findTopicsByChapter(chapterId: string) {
    return this.prisma.topic.findMany({
      where: { chapterId },
      include: {
        _count: {
          select: { questions: true, notes: true },
        },
      },
    });
  }

  // Admin APIs
  async createExam(data: { name: string; description: string; icon: string }) {
    return this.prisma.exam.create({ data });
  }

  async updateExam(id: string, data: { name?: string; description?: string; icon?: string }) {
    return this.prisma.exam.update({
      where: { id },
      data,
    });
  }

  async deleteExam(id: string) {
    return this.prisma.exam.delete({ where: { id } });
  }

  async createSubject(data: { name: string; description: string; examId: string }) {
    return this.prisma.subject.create({ data });
  }

  async createChapter(data: { name: string; description: string; subjectId: string; videoUrl?: string; videoDuration?: string }) {
    const chapter = await this.prisma.chapter.create({ data });
    // Automatically seed a default topic for questions, notes, and practice
    await this.prisma.topic.create({
      data: {
        name: 'Core Concepts and Formulas',
        description: 'Default topic for chapter content, notes, and questions.',
        chapterId: chapter.id,
      }
    });
    return chapter;
  }

  async updateChapter(id: string, data: { name?: string; description?: string; videoUrl?: string; videoDuration?: string }) {
    return this.prisma.chapter.update({
      where: { id },
      data,
    });
  }

  async createTopic(data: { name: string; description: string; chapterId: string }) {
    return this.prisma.topic.create({ data });
  }

  async deleteSubject(id: string) {
    return this.prisma.subject.delete({ where: { id } });
  }

  async deleteChapter(id: string) {
    return this.prisma.chapter.delete({ where: { id } });
  }

  async deleteTopic(id: string) {
    return this.prisma.topic.delete({ where: { id } });
  }

  async getWebsiteName() {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'website_name' }
    });
    return { value: setting ? setting.value : 'EduPremium' };
  }

  async updateWebsiteName(value: string) {
    return this.prisma.systemSetting.upsert({
      where: { key: 'website_name' },
      update: { value },
      create: { key: 'website_name', value }
    });
  }
}
