import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleType } from '@prisma/client';

import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  createPaginatedResponse,
  getPagination,
} from '../common/utils/pagination.util';

import { RecommendationService } from '../recommendations/recommendations.service';

import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';

@Injectable()
export class DiagnosisService {
  constructor(
    private prisma: PrismaService,
    private recommendationService: RecommendationService,
  ) {}

  async create(userId: string, dto: CreateDiagnosisDto) {
    const result = this.analyzeAnswers(dto.answers);

    const diagnosis = await this.prisma.diagnosis.create({
      data: {
        userId,
        answers: dto.answers,
        result,
      },
    });

    await this.recommendationService.generate(diagnosis.id, result);

    return diagnosis;
  }

  private analyzeAnswers(answers: Record<string, string>) {
    let autism = 0;
    let tdah = 0;
    let inclusive = 0;
    let dyslexia = 0;

    Object.values(answers).forEach((answer) => {
      if (answer === 'inclusive') {
        inclusive += 2;
      }

      if (answer === 'frequently') {
        autism += 1;
        tdah += 1;
      }

      if (answer === 'sometimes') {
        dyslexia += 1;
      }
    });

    if (autism >= 2) {
      return 'AUTISM_SUPPORT';
    }

    if (tdah >= 2) {
      return 'TDAH_SUPPORT';
    }

    if (inclusive >= 2) {
      return 'INCLUSIVE_EDUCATION';
    }

    if (dyslexia >= 2) {
      return 'DYSLEXIA_SUPPORT';
    }

    return 'GENERAL_PEDAGOGY';
  }

  async findAll(query: PaginationQueryDto) {
    const { page, limit, skip, take } = getPagination(query);
    const where = this.buildWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.diagnosis.findMany({
        where,
        include: {
          recommendations: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: query.order },
        skip,
        take,
      }),
      this.prisma.diagnosis.count({ where }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
  }

  async findByUser(userId: string, query: PaginationQueryDto) {
    const { page, limit, skip, take } = getPagination(query);
    const where = this.buildWhere({ ...query, userId });

    const [items, total] = await this.prisma.$transaction([
      this.prisma.diagnosis.findMany({
        where,
        include: {
          recommendations: {
            include: {
              learningPath: true,
              resource: true,
            },
          },
        },
        orderBy: { createdAt: query.order },
        skip,
        take,
      }),
      this.prisma.diagnosis.count({ where }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
  }

  findOne(id: string) {
    return this.prisma.diagnosis.findUnique({
      where: { id },
      include: {
        recommendations: true,
      },
    });
  }

  async findOneForUser(id: string, user: AuthenticatedUser) {
    const diagnosis = await this.findOne(id);
    this.assertCanAccess(diagnosis, user);
    return diagnosis;
  }

  async update(id: string, dto: UpdateDiagnosisDto, user: AuthenticatedUser) {
    const diagnosis = await this.findOne(id);
    this.assertCanAccess(diagnosis, user);

    return this.prisma.diagnosis.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, user: AuthenticatedUser) {
    const diagnosis = await this.findOne(id);
    this.assertCanAccess(diagnosis, user);

    return this.prisma.diagnosis.delete({
      where: { id },
    });
  }

  private assertCanAccess(
    diagnosis: { userId: string } | null,
    user: AuthenticatedUser,
  ) {
    if (!diagnosis) {
      throw new NotFoundException('Diagnóstico não encontrado');
    }

    if (diagnosis.userId !== user.id && user.role !== RoleType.ADMIN) {
      throw new ForbiddenException('Acesso negado ao diagnóstico');
    }
  }

  private buildWhere(query: PaginationQueryDto) {
    return {
      AND: [
        query.userId ? { userId: query.userId } : {},
        query.search
          ? {
              result: {
                equals: query.search as never,
              },
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
  }
}
