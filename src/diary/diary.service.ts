import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  createPaginatedResponse,
  getPagination,
} from '../common/utils/pagination.util';
import { CreateDiaryDto } from './dto/create-diary.dto';

@Injectable()
export class DiaryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDiaryDto, userId: string) {
    // valida se o lessonPlan existe e pertence ao usuário
    const lessonPlan = await this.prisma.lessonPlan.findUnique({
      where: { id: dto.lessonPlanId },
    });

    if (!lessonPlan) {
      throw new NotFoundException('Plano de aula não encontrado');
    }

    if (lessonPlan.userId !== userId) {
      throw new NotFoundException('Plano de aula inválido para este usuário');
    }

    return this.prisma.diary.create({
      data: {
        ...dto,
        userId,
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
                  whatWorked: {
                    contains: query.search,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  whatFailed: {
                    contains: query.search,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  inclusionReflection: {
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

    const [items, total] = await this.prisma.$transaction([
      this.prisma.diary.findMany({
        where,
        include: {
          lessonPlan: true,
        },
        orderBy: { createdAt: query.order },
        skip,
        take,
      }),
      this.prisma.diary.count({ where }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
  }

  async findByLessonPlan(lessonPlanId: string, userId: string) {
    const diary = await this.prisma.diary.findFirst({
      where: { lessonPlanId },
      include: {
        lessonPlan: true,
      },
    });

    if (diary && diary.userId !== userId) {
      throw new ForbiddenException('Acesso negado ao diário');
    }

    return diary;
  }

  async remove(id: string, userId: string) {
    const diary = await this.prisma.diary.findUnique({
      where: { id },
    });

    if (!diary) {
      throw new NotFoundException('Registro de diário não encontrado');
    }

    if (diary.userId !== userId) {
      throw new ForbiddenException('Acesso negado ao diário');
    }

    return this.prisma.diary.delete({
      where: { id },
    });
  }
}
