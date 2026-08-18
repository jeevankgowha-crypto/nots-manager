import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string) {
    if (!query || query.trim().length < 2) {
      return { questions: [], notes: [], tests: [], articles: [] };
    }

    const cleanQuery = query.trim();

    // Search Questions
    const questions = await this.prisma.question.findMany({
      where: {
        text: { contains: cleanQuery },
      },
      take: 5,
    });

    // Search Notes
    const notes = await this.prisma.note.findMany({
      where: {
        OR: [
          { title: { contains: cleanQuery } },
          { content: { contains: cleanQuery } },
        ],
      },
      select: {
        id: true,
        title: true,
        isPremium: true,
        estimatedReadTime: true,
      },
      take: 5,
    });

    // Search Mock Tests
    const tests = await this.prisma.mockTest.findMany({
      where: {
        OR: [
          { title: { contains: cleanQuery } },
          { description: { contains: cleanQuery } },
        ],
      },
      take: 5,
    });

    // Search Current Affairs (Articles)
    const articles = await this.prisma.currentAffairs.findMany({
      where: {
        OR: [
          { title: { contains: cleanQuery } },
          { content: { contains: cleanQuery } },
        ],
      },
      take: 5,
    });

    return {
      questions,
      notes,
      tests,
      articles,
    };
  }
}
