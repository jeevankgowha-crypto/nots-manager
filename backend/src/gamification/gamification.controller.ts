import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('leaderboard')
  async getLeaderboard() {
    return this.gamificationService.getLeaderboard();
  }

  @UseGuards(JwtAuthGuard)
  @Get('achievements')
  async getAchievements(@Req() req: any) {
    return this.gamificationService.getAchievements(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('streak/checkin')
  async checkInStreak(@Req() req: any) {
    return this.gamificationService.updateStreak(req.user.id);
  }
}
