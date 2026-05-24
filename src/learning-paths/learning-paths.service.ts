import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { UpdateProgressDto } from './dto/progress.dto';
import { FilterLearningPathDto } from './dto/filter-learning-path.dto';
import {
  createPaginatedResponse,
  getPagination,
} from '../common/utils/pagination.util';

@Injectable()
export class LearningPathService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // CREATE
  // =========================
  async create(dto: CreateLearningPathDto, userId: string) {
    return this.prisma.learningPath.create({
      data: {
        title: dto.title,
        description: dto.description,
        level: dto.level,
        category: dto.category,
        duration: dto.duration,

        createdBy: {
          connect: { id: userId },
        },

        steps: {
          create: dto.steps.map((step) => ({
            title: step.title,
            description: step.description,
            position: step.position,

            resources: {
              create: step.resources.map((resource) => ({
                title: resource.title,
                description: resource.description,
                type: resource.type,
                url: resource.url,

                category: {
                  connect: {
                    id: resource.categoryId,
                  },
                },

                createdBy: {
                  connect: { id: userId },
                },
              })),
            },
          })),
        },
      },

      include: {
        steps: {
          include: {
            resources: {
              include: {
                category: true,
                tags: {
                  include: {
                    tag: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  // =========================
  // FIND ALL (BASIC)
  // =========================
  async findAll(userId: string, query: FilterLearningPathDto) {
    const { page, limit, skip, take } = getPagination(query);
    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query.sort, query.order);

    const [learningPaths, total] = await this.prisma.$transaction([
      this.prisma.learningPath.findMany({
        where,
        include: {
          steps: {
            include: {
              resources: true,
              progress: {
                where: { userId },
              },
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.learningPath.count({ where }),
    ]);

    const items = learningPaths.map((path) => {
      const steps = path.steps.map((step) => ({
        id: step.id,
        title: step.title,
        description: step.description,
        resources: step.resources,
        completed: step.progress?.some((p) => p.completed) || false,
      }));

      const progress =
        steps.length === 0
          ? 0
          : Math.round(
              (steps.filter((s) => s.completed).length / steps.length) * 100,
            );

      return {
        id: path.id,
        title: path.title,
        description: path.description,
        level: path.level,
        category: path.category,
        duration: path.duration,
        progress,
        steps,
      };
    });

    return createPaginatedResponse(items, total, page, limit);
  }

  // =========================
  // FIND ONE
  // =========================
  async findOne(id: string, userId?: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id },
      include: {
        steps: {
          include: {
            resources: true,
            progress: userId
              ? {
                  where: { userId },
                }
              : false,
          },
        },
      },
    });

    if (!path) return null;

    const steps = path.steps.map((step) => ({
      id: step.id,
      title: step.title,
      description: step.description,
      resources: step.resources,
      completed: step.progress?.some((p) => p.completed) || false,
    }));

    const progress =
      steps.length === 0
        ? 0
        : Math.round(
            (steps.filter((s) => s.completed).length / steps.length) * 100,
          );

    return {
      id: path.id,
      title: path.title,
      description: path.description,
      level: path.level,
      category: path.category,
      duration: path.duration,
      progress,
      steps,
    };
  }

  // =========================
  // UPDATE PROGRESS
  // =========================
  async updateProgress(userId: string, dto: UpdateProgressDto) {
    return this.prisma.userProgress.upsert({
      where: {
        userId_stepId: {
          userId,
          stepId: dto.stepId,
        },
      },
      update: {
        completed: dto.completed,
      },
      create: {
        userId,
        stepId: dto.stepId,
        completed: dto.completed,
      },
    });
  }

  // =========================
  // WITH PROGRESS (DASHBOARD READY)
  // =========================
  async getLearningPathsWithProgress(
    userId: string,
    query: FilterLearningPathDto,
  ) {
    const { page, limit, skip, take } = getPagination(query);
    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query.sort, query.order);

    const [learningPaths, total] = await this.prisma.$transaction([
      this.prisma.learningPath.findMany({
        where,
        include: {
          steps: {
            include: {
              progress: {
                where: { userId },
              },
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.learningPath.count({ where }),
    ]);

    const items = learningPaths.map((path) => {
      const steps = path.steps.map((step) => ({
        id: step.id,
        title: step.title,
        completed: step.progress.some((p) => p.completed),
      }));

      const progress =
        steps.length === 0
          ? 0
          : Math.round(
              (steps.filter((s) => s.completed).length / steps.length) * 100,
            );

      return {
        id: path.id,
        title: path.title,
        description: path.description,
        level: path.level,
        category: path.category,
        duration: path.duration,
        progress,
        steps,
      };
    });

    return createPaginatedResponse(items, total, page, limit);
  }

  private buildWhere(query: FilterLearningPathDto) {
    return {
      AND: [
        query.category ? { category: query.category } : {},
        query.level ? { level: query.level } : {},
        query.userId ? { createdById: query.userId } : {},
        query.from || query.to
          ? {
              createdAt: {
                ...(query.from && { gte: new Date(query.from) }),
                ...(query.to && { lte: new Date(query.to) }),
              },
            }
          : {},
        query.search
          ? {
              OR: [
                {
                  title: {
                    contains: query.search,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  description: {
                    contains: query.search,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            }
          : {},
      ],
    };
  }

  private buildOrderBy(sort: string, order: 'asc' | 'desc') {
    const allowed = ['createdAt', 'updatedAt', 'title', 'level', 'category'];
    const field = allowed.includes(sort) ? sort : 'createdAt';

    return { [field]: order };
  }
}
