import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ExamsModule } from './exams/exams.module';
import { QuestionsModule } from './questions/questions.module';
import { NotesModule } from './notes/notes.module';
import { TestsModule } from './tests/tests.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { CurrentAffairsModule } from './current-affairs/current-affairs.module';
import { GamificationModule } from './gamification/gamification.module';
import { SearchModule } from './search/search.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ExamsModule,
    QuestionsModule,
    NotesModule,
    TestsModule,
    SubscriptionsModule,
    CurrentAffairsModule,
    GamificationModule,
    SearchModule,
    AdminModule,
  ],
})
export class AppModule {}
