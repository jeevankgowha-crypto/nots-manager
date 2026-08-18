import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async findQuestions(filters: {
    topicId?: string;
    difficulty?: string;
    isPYQ?: boolean;
    language?: string;
  }) {
    const where: any = {};
    if (filters.topicId) where.topicId = filters.topicId;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.isPYQ !== undefined) where.isPYQ = filters.isPYQ;
    if (filters.language) where.language = filters.language;

    return this.prisma.question.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findQuestionById(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async answerQuestion(userId: string, questionId: string, selectedOption: number) {
    const question = await this.findQuestionById(questionId);
    const isCorrect = question.correctOption === selectedOption;

    // Save/Update user progress
    await this.prisma.userProgress.upsert({
      where: {
        userId_questionId: { userId, questionId },
      },
      update: {
        isCorrect,
        attempts: { increment: 1 },
        lastAttempted: new Date(),
      },
      create: {
        userId,
        questionId,
        isCorrect,
        attempts: 1,
      },
    });

    // Award XP and coins on correct answer
    if (isCorrect) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          xpPoints: { increment: 10 },
          coins: { increment: 2 },
        },
      });
    }

    return {
      isCorrect,
      correctOption: question.correctOption,
      explanation: question.explanation,
    };
  }

  async getIncorrectQuestions(userId: string) {
    const wrongProgress = await this.prisma.userProgress.findMany({
      where: { userId, isCorrect: false },
      include: {
        question: true,
      },
    });
    return wrongProgress.map((p) => p.question);
  }

  async toggleBookmark(userId: string, questionId: string) {
    const existing = await this.prisma.bookmark.findUnique({
      where: {
        userId_type_targetId: {
          userId,
          type: 'QUESTION',
          targetId: questionId,
        },
      },
    });

    if (existing) {
      await this.prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return { bookmarked: false };
    } else {
      await this.prisma.bookmark.create({
        data: {
          userId,
          type: 'QUESTION',
          targetId: questionId,
        },
      });
      return { bookmarked: true };
    }
  }

  async getBookmarkedQuestions(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId, type: 'QUESTION' },
    });
    const questionIds = bookmarks.map((b) => b.targetId);
    return this.prisma.question.findMany({
      where: { id: { in: questionIds } },
    });
  }

  // Admin CRUD APIs
  async createQuestion(data: {
    text: string;
    options: string[];
    correctOption: number;
    explanation: string;
    difficulty?: string;
    language?: string;
    topicId: string;
    isPYQ?: boolean;
    pyqYear?: number;
  }) {
    return this.prisma.question.create({
      data: {
        ...data,
        options: JSON.stringify(data.options),
        difficulty: data.difficulty || 'MEDIUM',
        language: data.language || 'English',
        isPYQ: data.isPYQ || false,
        pyqYear: data.pyqYear || null,
      },
    });
  }

  async updateQuestion(id: string, data: any) {
    const updateData = { ...data };
    if (data.options) {
      updateData.options = JSON.stringify(data.options);
    }
    return this.prisma.question.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteQuestion(id: string) {
    return this.prisma.question.delete({ where: { id } });
  }

  async bulkImportQuestions(questionsList: any[]) {
    let imported = 0;
    for (const q of questionsList) {
      try {
        await this.createQuestion(q);
        imported++;
      } catch (err) {
        console.error('Failed to import question:', q, err);
      }
    }
    return { count: imported };
  }
}
