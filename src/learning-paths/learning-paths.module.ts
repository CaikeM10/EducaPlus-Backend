import { Module } from '@nestjs/common';
import { LearningPathService } from './learning-paths.service';
import { LearningPathController } from './learning-paths.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressModule } from '../progress/progress.module';

@Module({
  controllers: [LearningPathController],
  providers: [LearningPathService, PrismaService],
  imports: [ProgressModule]
})
export class LearningPathsModule {}
