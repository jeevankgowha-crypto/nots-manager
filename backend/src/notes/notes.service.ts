import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotesService {
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

    // Check 2-Day Trial
    const isTrialActive = new Date(user.trialEndDate) > new Date();
    if (isTrialActive) return true;

    // Check Subscriptions
    if (user.subscriptions.length > 0) return true;

    return false;
  }

  async findNotesByTopic(topicId: string) {
    return this.prisma.note.findMany({
      where: { topicId },
      select: {
        id: true,
        title: true,
        isPremium: true,
        estimatedReadTime: true,
        topicId: true,
        createdAt: true,
        updatedAt: true,
        // Exclude content for list to save bandwidth
      },
    });
  }

  async findNoteById(id: string, userId?: string) {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: {
        topic: {
          include: {
            chapter: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    if (!note) throw new NotFoundException('Note not found');

    let isLocked = false;
    let content = note.content;

    if (note.isPremium) {
      if (!userId) {
        isLocked = true;
      } else {
        const hasAccess = await this.checkAccess(userId);
        if (!hasAccess) {
          isLocked = true;
        }
      }
    }

    if (isLocked) {
      // Blur/Trunk content
      content = note.content.slice(0, 150) + '\n\n[PREMIUM NOTE LOCKED - Purchase subscription or start trial to read full notes]';
    }

    return {
      ...note,
      content,
      isLocked,
    };
  }

  async toggleBookmark(userId: string, noteId: string) {
    const existing = await this.prisma.bookmark.findUnique({
      where: {
        userId_type_targetId: {
          userId,
          type: 'NOTE',
          targetId: noteId,
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
          type: 'NOTE',
          targetId: noteId,
        },
      });
      return { bookmarked: true };
    }
  }

  async getBookmarkedNotes(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId, type: 'NOTE' },
    });
    const noteIds = bookmarks.map((b) => b.targetId);
    return this.prisma.note.findMany({
      where: { id: { in: noteIds } },
    });
  }

  // Admin APIs
  async createNote(data: {
    title: string;
    content: string;
    pdfUrl?: string;
    isPremium?: boolean;
    estimatedReadTime?: number;
    topicId: string;
  }) {
    return this.prisma.note.create({
      data: {
        ...data,
        isPremium: data.isPremium || false,
        estimatedReadTime: data.estimatedReadTime || 5,
      },
    });
  }

  async updateNote(id: string, data: any) {
    return this.prisma.note.update({
      where: { id },
      data,
    });
  }

  async deleteNote(id: string) {
    return this.prisma.note.delete({ where: { id } });
  }
}
