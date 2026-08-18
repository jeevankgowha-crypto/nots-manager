import { Controller, Get, Post, Body, Param, UseGuards, Req, Query, Delete } from '@nestjs/common';
import { TestsService } from './tests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  async getTests(@Query('examId') examId: string) {
    return this.testsService.findTestsByExam(examId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Req() req: any) {
    return this.testsService.getAttemptHistory(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getTest(@Param('id') id: string, @Req() req: any) {
    return this.testsService.findTestById(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/submit')
  async submitTest(
    @Param('id') testId: string,
    @Body() body: { answers: Record<string, number>; timeTakenSeconds: number },
    @Req() req: any,
  ) {
    return this.testsService.submitTest(req.user.id, testId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post()
  async createTest(@Body() body: any) {
    return this.testsService.createTest(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete(':id')
  async deleteTest(@Param('id') id: string) {
    return this.testsService.deleteTest(id);
  }
}
