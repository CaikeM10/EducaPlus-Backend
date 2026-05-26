import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { LessonStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { ProgressCalculatorService } from './progress-calculator.service';

@Injectable()
export class LearningProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: ProgressCalculatorService,
  ) {}

  async ensureLessonProgress(
    userId: string,
    stepId: string,
  ) {
    const step = await this.prisma.step.findUnique({
      where: {
        id: stepId,
      },
    });

    if (!step) {
      throw new NotFoundException('Aula não encontrada');
    }

    return this.prisma.lessonProgress.upsert({
      where: {
        userId_stepId: {
          userId,
          stepId,
        },
      },
      update: {},
      create: {
        userId,
        stepId,
      },
    });
  }

  async markMaterialAsCompleted(params: {
    userId: string;
    resourceId: string;
    stepId: string;
  }) {
    const { userId, resourceId, stepId } = params;

    await this.ensureLessonProgress(userId, stepId);

    await this.prisma.resourceConsumption.upsert({
      where: {
        userId_resourceId_stepId: {
          userId,
          resourceId,
          stepId,
        },
      },
      update: {
        status: 'COMPLETED',
        completedAt: new Date(),
        progressPercent: 100,
      },
      create: {
        userId,
        resourceId,
        stepId,
        status: 'COMPLETED',
        completedAt: new Date(),
        progressPercent: 100,
      },
    });

    const totalResources = await this.prisma.resource.count({
      where: {
        stepId,
      },
    });

    const completedResources =
      await this.prisma.resourceConsumption.count({
        where: {
          userId,
          stepId,
          status: 'COMPLETED',
        },
      });

    const allCompleted =
      totalResources > 0 &&
      completedResources >= totalResources;

    return this.prisma.lessonProgress.update({
      where: {
        userId_stepId: {
          userId,
          stepId,
        },
      },
      data: {
        materialsCompleted: allCompleted,
        status: allCompleted
          ? LessonStatus.READY_FOR_QUIZ
          : LessonStatus.IN_PROGRESS,
      },
    });
  }

  async getLearningPathProgress(
    userId: string,
    learningPathId: string,
  ) {
    const steps = await this.prisma.step.findMany({
      where: {
        learningPathId,
      },
      select: {
        id: true,
      },
    });

    const totalLessons = steps.length;

    if (totalLessons === 0) {
      return {
        progress: 0,
        completedLessons: 0,
        totalLessons: 0,
        status: 'NOT_STARTED',
      };
    }

    const completedLessons =
      await this.prisma.lessonProgress.count({
        where: {
          userId,
          stepId: {
            in: steps.map((step) => step.id),
          },
          status: LessonStatus.COMPLETED,
        },
      });

    const progress =
      this.calculator.calculatePercentage({
        totalLessons,
        completedLessons,
      });

    return {
      progress,
      completedLessons,
      totalLessons,
      status:
        this.calculator.calculateStatus(progress),
    };
  }

  async syncLegacyUserProgress(params: {
    userId: string;
    stepId: string;
    completed: boolean;
  }) {
    const { userId, stepId, completed } = params;

    return this.prisma.userProgress.upsert({
      where: {
        userId_stepId: {
          userId,
          stepId,
        },
      },
      update: {
        completed,
      },
      create: {
        userId,
        stepId,
        completed,
      },
    });
  }
}