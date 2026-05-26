import { Injectable } from '@nestjs/common';

type ProgressInput = {
  totalLessons: number;
  completedLessons: number;
};

@Injectable()
export class ProgressCalculatorService {
  calculatePercentage({
    totalLessons,
    completedLessons,
  }: ProgressInput): number {
    if (totalLessons <= 0) {
      return 0;
    }

    return Math.round((completedLessons / totalLessons) * 100);
  }

  calculateStatus(progress: number) {
    if (progress <= 0) {
      return 'NOT_STARTED';
    }

    if (progress >= 100) {
      return 'COMPLETED';
    }

    return 'IN_PROGRESS';
  }
}