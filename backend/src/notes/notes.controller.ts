import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async getNotes(@Query('topicId') topicId: string) {
    return this.notesService.findNotesByTopic(topicId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookmarks')
  async getBookmarks(@Req() req: any) {
    return this.notesService.getBookmarkedNotes(req.user.id);
  }

  // Get note content - optional auth fallback check (to evaluate premium blur)
  @Get(':id')
  async getNoteById(@Param('id') id: string, @Query('userId') userId?: string) {
    return this.notesService.findNoteById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/bookmark')
  async toggleBookmark(@Param('id') noteId: string, @Req() req: any) {
    return this.notesService.toggleBookmark(req.user.id, noteId);
  }

  // Admin APIs
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Post()
  async createNote(@Body() body: any) {
    return this.notesService.createNote(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Put(':id')
  async updateNote(@Param('id') id: string, @Body() body: any) {
    return this.notesService.updateNote(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @Delete(':id')
  async deleteNote(@Param('id') id: string) {
    return this.notesService.deleteNote(id);
  }
}
