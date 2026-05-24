import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  createPaginatedResponse,
  getPagination,
} from '../common/utils/pagination.util';
import { CreateLessonPlanDto } from './dto/create-lesson-plan.dto';
import { UpdateLessonPlanDto } from './dto/update-lesson-plan.dto';

@Injectable()
export class LessonPlanService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLessonPlanDto, userId: string) {
    return this.prisma.lessonPlan.create({
      data: {
        title: dto.title,
        description: dto.description,
        content: dto.content,
        objectives: dto.objectives ?? [],
        strategies: dto.strategies ?? [],
        inclusions: dto.inclusions ?? [],
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async findAllByUser(userId: string, query: PaginationQueryDto) {
    const { page, limit, skip, take } = getPagination(query);
    const where = {
      AND: [
        { userId },
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
                {
                  content: {
                    contains: query.search,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            }
          : {},
        query.from || query.to
          ? {
              createdAt: {
                ...(query.from && { gte: new Date(query.from) }),
                ...(query.to && { lte: new Date(query.to) }),
              },
            }
          : {},
      ],
    };
    const allowed = ['createdAt', 'updatedAt', 'title'];
    const sort = allowed.includes(query.sort) ? query.sort : 'createdAt';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.lessonPlan.findMany({
        where,
        orderBy: { [sort]: query.order },
        skip,
        take,
      }),
      this.prisma.lessonPlan.count({ where }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
  }

  async findOne(id: string, userId: string) {
    const lessonPlan = await this.prisma.lessonPlan.findUnique({
      where: { id },
    });

    if (!lessonPlan) {
      throw new NotFoundException('Plano de aula não encontrado');
    }

    if (lessonPlan.userId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    return lessonPlan;
  }

  async update(id: string, dto: UpdateLessonPlanDto, userId: string) {
    const lessonPlan = await this.findOne(id, userId);

    return this.prisma.lessonPlan.update({
      where: { id: lessonPlan.id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.objectives !== undefined && { objectives: dto.objectives }),
        ...(dto.strategies !== undefined && { strategies: dto.strategies }),
        ...(dto.inclusions !== undefined && { inclusions: dto.inclusions }),
      },
    });
  }

  async remove(id: string, userId: string) {
    const lessonPlan = await this.findOne(id, userId);

    return this.prisma.lessonPlan.delete({
      where: { id: lessonPlan.id },
    });
  }
}
