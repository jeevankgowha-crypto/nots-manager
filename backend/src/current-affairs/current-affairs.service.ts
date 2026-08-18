import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurrentAffairsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.currentAffairs.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: string) {
    const item = await this.prisma.currentAffairs.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Current affairs item not found');
    return item;
  }

  async submitQuiz(userId: string, id: string, body: { answers: number[] }) {
    const item = await this.findById(id);
    if (!item.isQuiz || !item.quizQuestions) {
      throw new NotFoundException('No quiz found for this current affairs item');
    }

    const questions = JSON.parse(item.quizQuestions);
    let correctCount = 0;

    for (let i = 0; i < questions.length; i++) {
      if (body.answers[i] !== undefined && body.answers[i] === questions[i].correctOption) {
        correctCount++;
      }
    }

    // Award XP and coins: 15 XP + 5 coins for completing CA quiz
    const xpReward = 15 + correctCount * 5;
    const coinsReward = 5;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xpPoints: { increment: xpReward },
        coins: { increment: coinsReward },
      },
    });

    return {
      correctCount,
      totalCount: questions.length,
      xpReward,
      coinsReward,
    };
  }

  // Admin APIs
  async create(data: { title: string; content: string; category: string; isQuiz?: boolean; quizQuestions?: any[] }) {
    return this.prisma.currentAffairs.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        isQuiz: data.isQuiz || false,
        quizQuestions: data.quizQuestions ? JSON.stringify(data.quizQuestions) : null,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.currentAffairs.delete({ where: { id } });
  }
}
