import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        xpPoints: true,
        streakCount: true,
      },
      orderBy: { xpPoints: 'desc' },
      take: 20,
    });
  }

  async updateStreak(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    let newStreak = user.streakCount;
    let xpBonus = 0;
    let coinsBonus = 0;

    if (!lastActive) {
      // First activity
      newStreak = 1;
      xpBonus = 10;
      coinsBonus = 1;
    } else {
      // Calculate day difference
      const timeDiff = now.getTime() - lastActive.getTime();
      const diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Active on the consecutive day
        newStreak += 1;
        xpBonus = 10 + Math.min(20, newStreak * 2); // incremental XP bonus capped at 30
        coinsBonus = Math.floor(newStreak / 5) + 1; // bonus coin every 5th streak day
      } else if (diffDays > 1) {
        // Streak broken
        newStreak = 1;
        xpBonus = 10;
        coinsBonus = 1;
      }
      // If diffDays === 0, user already active today, no change
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        streakCount: newStreak,
        lastActiveDate: now,
        xpPoints: { increment: xpBonus },
        coins: { increment: coinsBonus },
      },
    });

    return {
      streakCount: updatedUser.streakCount,
      xpPoints: updatedUser.xpPoints,
      coins: updatedUser.coins,
      streakUpdated: newStreak !== user.streakCount,
      xpBonus,
      coinsBonus,
    };
  }

  async getAchievements(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    // Define standard achievements
    const badges = [
      {
        id: 'streak_3',
        name: 'Consistency Starter',
        description: 'Achieve a 3-day study streak.',
        icon: 'Flame',
        unlocked: user.streakCount >= 3,
        currentProgress: user.streakCount,
        maxProgress: 3,
      },
      {
        id: 'streak_10',
        name: 'Habit Builder',
        description: 'Achieve a 10-day study streak.',
        icon: 'Compass',
        unlocked: user.streakCount >= 10,
        currentProgress: user.streakCount,
        maxProgress: 10,
      },
      {
        id: 'xp_500',
        name: 'Knowledge Seeker',
        description: 'Earn 500 XP points.',
        icon: 'Award',
        unlocked: user.xpPoints >= 500,
        currentProgress: user.xpPoints,
        maxProgress: 500,
      },
      {
        id: 'xp_1000',
        name: 'Elite Scholar',
        description: 'Earn 1000 XP points.',
        icon: 'ShieldAlert',
        unlocked: user.xpPoints >= 1000,
        currentProgress: user.xpPoints,
        maxProgress: 1000,
      },
    ];

    return {
      xp: user.xpPoints,
      coins: user.coins,
      streakCount: user.streakCount,
      badges,
    };
  }
}
