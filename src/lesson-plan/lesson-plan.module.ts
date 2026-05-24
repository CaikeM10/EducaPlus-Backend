import { Module } from '@nestjs/common';
import { LessonPlanController } from './lesson-plan.controller';
import { LessonPlanService } from './lesson-plan.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LessonPlanController],
  providers: [LessonPlanService, PrismaService],
  exports: [LessonPlanService],
})
export class LessonPlanModule {}
