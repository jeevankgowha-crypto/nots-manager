import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CurrentAffairsService } from './current-affairs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('current-affairs')
export class CurrentAffairsController {
  constructor(private readonly currentAffairsService: CurrentAffairsService) {}

  @Get()
  async getAll() {
    return this.currentAffairsService.findAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.currentAffairsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/quiz/submit')
  async submitQuiz(@Param('id') id: string, @Body() body: { answers: number[] }, @Req() req: any) {
    return this.currentAffairsService.submitQuiz(req.user.id, id, body);
  }

  // Admin APIs
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post()
  async create(@Body() body: any) {
    return this.currentAffairsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.currentAffairsService.delete(id);
  }
}
