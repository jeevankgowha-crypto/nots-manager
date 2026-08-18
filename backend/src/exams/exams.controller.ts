import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  async getAllExams() {
    return this.examsService.findAllExams();
  }

  @Get(':id')
  async getExamById(@Param('id') id: string) {
    return this.examsService.findExamById(id);
  }

  @Get(':id/subjects')
  async getSubjects(@Param('id') examId: string) {
    return this.examsService.findSubjectsByExam(examId);
  }

  @Get('subjects/:subjectId/chapters')
  async getChapters(@Param('subjectId') subjectId: string) {
    return this.examsService.findChaptersBySubject(subjectId);
  }

  @Get('chapters/:chapterId/topics')
  async getTopics(@Param('chapterId') chapterId: string) {
    return this.examsService.findTopicsByChapter(chapterId);
  }

  // Admin Only Endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post()
  async createExam(@Body() body: { name: string; description: string; icon: string }) {
    return this.examsService.createExam(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Put(':id')
  async updateExam(@Param('id') id: string, @Body() body: any) {
    return this.examsService.updateExam(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete(':id')
  async deleteExam(@Param('id') id: string) {
    return this.examsService.deleteExam(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post('subjects')
  async createSubject(@Body() body: { name: string; description: string; examId: string }) {
    return this.examsService.createSubject(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post('chapters')
  async createChapter(@Body() body: { name: string; description: string; subjectId: string }) {
    return this.examsService.createChapter(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post('topics')
  async createTopic(@Body() body: { name: string; description: string; chapterId: string }) {
    return this.examsService.createTopic(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete('subjects/:id')
  async deleteSubject(@Param('id') id: string) {
    return this.examsService.deleteSubject(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Put('chapters/:id')
  async updateChapter(@Param('id') id: string, @Body() body: any) {
    return this.examsService.updateChapter(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete('chapters/:id')
  async deleteChapter(@Param('id') id: string) {
    return this.examsService.deleteChapter(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete('topics/:id')
  async deleteTopic(@Param('id') id: string) {
    return this.examsService.deleteTopic(id);
  }

  @Get('settings/website-name')
  async getWebsiteName() {
    return this.examsService.getWebsiteName();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post('settings/website-name')
  async updateWebsiteName(@Body() body: { value: string }) {
    return this.examsService.updateWebsiteName(body.value);
  }
}
