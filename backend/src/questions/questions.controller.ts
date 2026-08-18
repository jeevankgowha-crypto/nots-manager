import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  async getQuestions(
    @Query('topicId') topicId?: string,
    @Query('difficulty') difficulty?: string,
    @Query('isPYQ') isPYQ?: string,
    @Query('language') language?: string,
  ) {
    const isPyqBool = isPYQ === undefined ? undefined : isPYQ === 'true';
    return this.questionsService.findQuestions({
      topicId,
      difficulty,
      isPYQ: isPyqBool,
      language,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('incorrect')
  async getIncorrect(@Req() req: any) {
    return this.questionsService.getIncorrectQuestions(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookmarks')
  async getBookmarks(@Req() req: any) {
    return this.questionsService.getBookmarkedQuestions(req.user.id);
  }

  @Get(':id')
  async getQuestionById(@Param('id') id: string) {
    return this.questionsService.findQuestionById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/answer')
  async submitAnswer(
    @Param('id') questionId: string,
    @Body() body: { selectedOption: number },
    @Req() req: any,
  ) {
    return this.questionsService.answerQuestion(req.user.id, questionId, body.selectedOption);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/bookmark')
  async toggleBookmark(@Param('id') questionId: string, @Req() req: any) {
    return this.questionsService.toggleBookmark(req.user.id, questionId);
  }

  // Admin Only Endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post()
  async createQuestion(@Body() body: any) {
    return this.questionsService.createQuestion(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Put(':id')
  async updateQuestion(@Param('id') id: string, @Body() body: any) {
    return this.questionsService.updateQuestion(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete(':id')
  async deleteQuestion(@Param('id') id: string) {
    return this.questionsService.deleteQuestion(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post('import')
  async bulkImport(@Body() body: { questions: any[] }) {
    return this.questionsService.bulkImportQuestions(body.questions);
  }
}
