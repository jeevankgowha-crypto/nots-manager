import { Module } from '@nestjs/common';
import { CurrentAffairsService } from './current-affairs.service';
import { CurrentAffairsController } from './current-affairs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CurrentAffairsController],
  providers: [CurrentAffairsService],
  exports: [CurrentAffairsService],
})
export class CurrentAffairsModule {}
