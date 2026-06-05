import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DiagnosisResult, RoleType } from '@prisma/client';

import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

import {
  createPaginatedResponse,
  getPagination,
} from '../common/utils/pagination.util';

import { PrismaService } from '../prisma/prisma.service';

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
    const profile = this.analyzeAnswers(dto.answers);

    const diagnosis = await this.prisma.diagnosis.create({
      data: {
        userId,

        answers: dto.answers,

        result: profile.primaryProfile,

        profile,
      },
    });

    await this.recommendationService.generate(
      diagnosis.id,

      profile.primaryProfile,
    );

    return diagnosis;
  }

  /**
   * ENGINE DE PERFIL PEDAGÓGICO
   */
  private analyzeAnswers(answers: Record<string, string>) {
    const scores = {
      autism: 0,

      tdah: 0,

      dyslexia: 0,

      inclusive: 0,

      classroom: 0,

      curriculum: 0,

      assessment: 0,
    };

    Object.values(answers).forEach((answer) => {
      switch (answer) {
        case 'frequently':
          scores.autism += 2;

          scores.tdah += 2;

          break;

        case 'sometimes':
          scores.autism += 1;

          scores.dyslexia += 1;

          break;

        case 'inclusive':
          scores.inclusive += 3;

          break;

        case 'classroom':
          scores.classroom += 2;

          break;

        case 'curriculum':
          scores.curriculum += 2;

          break;

        case 'assessment':
          scores.assessment += 2;

          break;
      }
    });

    let primaryProfile: DiagnosisResult = DiagnosisResult.GENERAL_PEDAGOGY;

    let recommendationLevel = 'MODERATE';

    const strengths: string[] = [];

    const focusAreas: string[] = [];

    /**
     * PERFIL PRINCIPAL
     */
    if (scores.autism >= 4) {
      primaryProfile = DiagnosisResult.AUTISM_SUPPORT;

      focusAreas.push('Estratégias para TEA');
    }

    if (scores.tdah >= 4) {
      primaryProfile = DiagnosisResult.TDAH_SUPPORT;

      focusAreas.push('Estratégias para TDAH');
    }

    if (scores.dyslexia >= 3) {
      primaryProfile = DiagnosisResult.DYSLEXIA_SUPPORT;

      focusAreas.push('Adaptação para Dislexia');
    }

    if (scores.inclusive >= 3) {
      primaryProfile = DiagnosisResult.INCLUSIVE_EDUCATION;

      strengths.push('Educação Inclusiva');
    }

    /**
     * COMPETÊNCIAS
     */
    if (scores.classroom >= 2) {
      strengths.push('Gestão de Sala');
    }

    if (scores.curriculum >= 2) {
      strengths.push('Adaptação Curricular');
    }

    if (scores.assessment >= 2) {
      strengths.push('Avaliação Inclusiva');
    }

    /**
     * SCORE GERAL
     */
    const totalScore = Object.values(scores).reduce(
      (acc, value) => acc + value,
      0,
    );

    /**
     * NÍVEL
     */
    if (totalScore >= 10) {
      recommendationLevel = 'HIGH';
    } else if (totalScore >= 5) {
      recommendationLevel = 'MODERATE';
    } else {
      recommendationLevel = 'INITIAL';
    }

    return {
      primaryProfile,

      recommendationLevel,

      scores,

      strengths,

      focusAreas,

      totalScore,

      generatedAt: new Date(),
    };
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

        orderBy: {
          createdAt: query.order,
        },

        skip,

        take,
      }),

      this.prisma.diagnosis.count({
        where,
      }),
    ]);

    return createPaginatedResponse(
      items,

      total,

      page,

      limit,
    );
  }

  async findByUser(
    userId: string,

    query: PaginationQueryDto,
  ) {
    const { page, limit, skip, take } = getPagination(query);

    const where = this.buildWhere({
      ...query,

      userId,
    });

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

        orderBy: {
          createdAt: query.order,
        },

        skip,

        take,
      }),

      this.prisma.diagnosis.count({
        where,
      }),
    ]);

    return createPaginatedResponse(
      items,

      total,

      page,

      limit,
    );
  }

  findOne(id: string) {
    return this.prisma.diagnosis.findUnique({
      where: { id },

      include: {
        recommendations: true,
      },
    });
  }

  async findOneForUser(
    id: string,

    user: AuthenticatedUser,
  ) {
    const diagnosis = await this.findOne(id);

    this.assertCanAccess(
      diagnosis,

      user,
    );

    return diagnosis;
  }

  async update(
    id: string,

    dto: UpdateDiagnosisDto,

    user: AuthenticatedUser,
  ) {
    const diagnosis = await this.findOne(id);

    this.assertCanAccess(
      diagnosis,

      user,
    );

    return this.prisma.diagnosis.update({
      where: { id },

      data: dto,
    });
  }

  async remove(
    id: string,

    user: AuthenticatedUser,
  ) {
    const diagnosis = await this.findOne(id);

    this.assertCanAccess(
      diagnosis,

      user,
    );

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
        query.userId
          ? {
              userId: query.userId,
            }
          : {},

        query.search
          ? {
              result: {
                equals: query.search as DiagnosisResult,
              },
            }
          : {},

        query.from || query.to
          ? {
              createdAt: {
                ...(query.from && {
                  gte: new Date(query.from),
                }),

                ...(query.to && {
                  lte: new Date(query.to),
                }),
              },
            }
          : {},
      ],
    };
  }
}
