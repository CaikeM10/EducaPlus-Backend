import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityItem, ActivityType } from './types/activity-item.type';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecentActivity(userId: string): Promise<ActivityItem[]> {
    const [progress, lessonPlans, diaries] = await Promise.all([
      this.prisma.userProgress.findMany({
        where: { userId },
        include: {
          step: {
            include: {
              learningPath: {
                include: {
                  steps: {
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.lessonPlan.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      }),
      this.prisma.diary.findMany({
        where: { userId },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          lessonPlan: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      }),
    ]);

    const activities: ActivityItem[] = [
      ...this.buildLearningPathActivities(progress),
      ...lessonPlans.map((plan) => ({
        id: `lesson-plan-${plan.id}`,
        type: this.wasUpdated(plan.createdAt, plan.updatedAt)
          ? ActivityType.LESSON_PLAN_UPDATED
          : ActivityType.LESSON_PLAN_CREATED,
        title: plan.title,
        occurredAt: this.wasUpdated(plan.createdAt, plan.updatedAt)
          ? plan.updatedAt
          : plan.createdAt,
        status: 'info' as const,
        entityId: plan.id,
      })),
      ...diaries.map((diary) => ({
        id: `diary-${diary.id}`,
        type: this.wasUpdated(diary.createdAt, diary.updatedAt)
          ? ActivityType.DIARY_UPDATED
          : ActivityType.DIARY_CREATED,
        title: diary.lessonPlan.title,
        occurredAt: this.wasUpdated(diary.createdAt, diary.updatedAt)
          ? diary.updatedAt
          : diary.createdAt,
        status: 'warning' as const,
        entityId: diary.id,
      })),
    ];

    return activities
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, 10);
  }

  private buildLearningPathActivities(
    progress: Array<{
      id: string;
      completed: boolean;
      updatedAt: Date;
      step: {
        learningPath: {
          id: string;
          title: string;
          steps: Array<{ id: string }>;
        };
      };
    }>,
  ): ActivityItem[] {
    const byPath = new Map<
      string,
      {
        title: string;
        totalSteps: number;
        completedSteps: number;
        latestAt: Date;
      }
    >();

    for (const item of progress) {
      const path = item.step.learningPath;
      const current = byPath.get(path.id) ?? {
        title: path.title,
        totalSteps: path.steps.length,
        completedSteps: 0,
        latestAt: item.updatedAt,
      };

      if (item.completed) {
        current.completedSteps += 1;
      }

      if (item.updatedAt > current.latestAt) {
        current.latestAt = item.updatedAt;
      }

      byPath.set(path.id, current);
    }

    return Array.from(byPath.entries())
      .filter(([, item]) => item.completedSteps > 0)
      .map(([pathId, item]) => ({
        id: `learning-path-${pathId}`,
        type:
          item.totalSteps > 0 && item.completedSteps === item.totalSteps
            ? ActivityType.LEARNING_PATH_COMPLETED
            : ActivityType.LEARNING_PATH_STARTED,
        title: item.title,
        occurredAt: item.latestAt,
        status:
          item.totalSteps > 0 && item.completedSteps === item.totalSteps
            ? ('success' as const)
            : ('info' as const),
        entityId: pathId,
      }));
  }

  private wasUpdated(createdAt: Date, updatedAt: Date) {
    return updatedAt.getTime() - createdAt.getTime() > 1000;
  }
}
