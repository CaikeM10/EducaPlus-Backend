import { Injectable } from '@nestjs/common';
import { LessonStatus } from '@prisma/client';

@Injectable()
export class ProgressPresenter {
  toLessonProgress(progress: {
    id: string;
    status: LessonStatus;
    materialsCompleted: boolean;
    quizPassed: boolean;
    completedAt: Date | null;
    updatedAt: Date;
  }) {
    return {
      id: progress.id,
      status: progress.status,
      materialsCompleted: progress.materialsCompleted,
      quizPassed: progress.quizPassed,
      completedAt: progress.completedAt,
      updatedAt: progress.updatedAt,
    };
  }

  toLearningPathProgress(data: {
    progress: number;
    completedLessons: number;
    totalLessons: number;
    status: string;
  }) {
    return {
      progress: data.progress,
      completedLessons: data.completedLessons,
      totalLessons: data.totalLessons,
      status: data.status,
    };
  }
}