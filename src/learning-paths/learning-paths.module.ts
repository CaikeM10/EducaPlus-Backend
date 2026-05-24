import { Module } from '@nestjs/common';
import { LearningPathService } from './learning-paths.service';
import { LearningPathController } from './learning-paths.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LearningPathController],
  providers: [LearningPathService, PrismaService],
})
export class LearningPathsModule {}
