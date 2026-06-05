import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { LearningCategory, Resource, RoleType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

import {
  createPaginatedResponse,
  getPagination,
} from '../common/utils/pagination.util';

@Injectable()
export class RecommendationService {
  constructor(private prisma: PrismaService) {}

  /**
   * ENGINE DE RECOMENDAÇÃO
   */
  async generate(
    diagnosisId: string,

    result: string,
  ) {
    const diagnosis = await this.prisma.diagnosis.findUnique({
      where: {
        id: diagnosisId,
      },

      select: {
        profile: true,
      },
    });

    if (!diagnosis) {
      throw new NotFoundException('Diagnóstico não encontrado');
    }

    const profile = diagnosis.profile as {
      strengths?: string[];

      focusAreas?: string[];

      recommendationLevel?: string;
    };

    /**
     * MAPEAMENTO
     */
    const categoryMap: Record<string, LearningCategory> = {
      AUTISM_SUPPORT: LearningCategory.AUTISMO,

      TDAH_SUPPORT: LearningCategory.TDAH,

      DYSLEXIA_SUPPORT: LearningCategory.DISLEXIA,

      INCLUSIVE_EDUCATION: LearningCategory.INCLUSAO,

      GENERAL_PEDAGOGY: LearningCategory.GERAL,
    };

    const category = categoryMap[result];

    if (!category) {
      return;
    }

    /**
     * PRIORIZAÇÃO
     */
    const recommendationLevel = profile?.recommendationLevel ?? 'INITIAL';

    const take =
      recommendationLevel === 'HIGH'
        ? 8
        : recommendationLevel === 'MODERATE'
          ? 5
          : 3;

    /**
     * TRILHAS
     */
    const learningPaths = await this.prisma.learningPath.findMany({
      where: {
        category,
      },

      include: {
        steps: {
          include: {
            resources: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },

      take,
    });

    /**
     * PROCESSAMENTO
     */
    for (const path of learningPaths) {
      /**
       * EVITA DUPLICIDADE
       */
      const existingPathRecommendation =
        await this.prisma.recommendation.findFirst({
          where: {
            diagnosisId,

            learningPathId: path.id,
          },
        });

      /**
       * CONTEXTO
       */
      const strengths = profile?.strengths?.join(', ') ?? 'Educação Inclusiva';

      const focus =
        profile?.focusAreas?.join(', ') ?? 'Desenvolvimento Pedagógico';

      /**
       * REASON
       */
      const recommendationReason = `
Trilha recomendada com base no perfil pedagógico identificado.

Áreas de foco:
${focus}

Competências:
${strengths}
      `.trim();

      /**
       * CRIA TRILHA
       */
      if (!existingPathRecommendation) {
        await this.prisma.recommendation.create({
          data: {
            diagnosisId,

            learningPathId: path.id,

            reason: recommendationReason,
          },
        });
      }

      /**
       * RECURSOS
       */
      const resources: Resource[] = path.steps.flatMap(
        (step) => step.resources,
      );

      for (const resource of resources) {
        const existingResourceRecommendation =
          await this.prisma.recommendation.findFirst({
            where: {
              diagnosisId,

              resourceId: resource.id,
            },
          });

        /**
         * REASON RECURSO
         */
        const resourceReason = `
Recurso sugerido para fortalecer competências em:
${focus}
        `.trim();

        /**
         * CRIA RECURSO
         */
        if (!existingResourceRecommendation) {
          await this.prisma.recommendation.create({
            data: {
              diagnosisId,

              resourceId: resource.id,

              reason: resourceReason,
            },
          });
        }
      }
    }
  }

  /**
   * LISTAGEM GERAL
   */
  async findAll(query: PaginationQueryDto) {
    const { page, limit, skip, take } = getPagination(query);

    const where = this.buildWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.recommendation.findMany({
        where,

        include: {
          diagnosis: true,

          learningPath: true,

          resource: true,
        },

        orderBy: {
          createdAt: query.order,
        },

        skip,

        take,
      }),

      this.prisma.recommendation.count({
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

  /**
   * LISTAGEM POR DIAGNÓSTICO
   */
  findByDiagnosis(
    diagnosisId: string,

    user: AuthenticatedUser,

    query: PaginationQueryDto,
  ) {
    return this.findByDiagnosisForUser(
      diagnosisId,

      user,

      query,
    );
  }

  /**
   * ACESSO PRIVADO
   */
  private async findByDiagnosisForUser(
    diagnosisId: string,

    user: AuthenticatedUser,

    query: PaginationQueryDto,
  ) {
    const diagnosis = await this.prisma.diagnosis.findUnique({
      where: {
        id: diagnosisId,
      },

      select: {
        userId: true,
      },
    });

    if (!diagnosis) {
      throw new NotFoundException('Diagnóstico não encontrado');
    }

    if (diagnosis.userId !== user.id && user.role !== RoleType.ADMIN) {
      throw new ForbiddenException('Acesso negado às recomendações');
    }

    const { page, limit, skip, take } = getPagination(query);

    const where = this.buildWhere({
      ...query,

      search: query.search,
    });

    const finalWhere = {
      AND: [
        {
          diagnosisId,
        },

        where,
      ],
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.recommendation.findMany({
        where: finalWhere,

        include: {
          learningPath: true,

          resource: true,
        },

        orderBy: {
          createdAt: query.order,
        },

        skip,

        take,
      }),

      this.prisma.recommendation.count({
        where: finalWhere,
      }),
    ]);

    return createPaginatedResponse(
      items,

      total,

      page,

      limit,
    );
  }

  /**
   * FILTROS
   */
  private buildWhere(query: PaginationQueryDto) {
    return {
      AND: [
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

        query.search
          ? {
              reason: {
                contains: query.search,

                mode: 'insensitive' as const,
              },
            }
          : {},
      ],
    };
  }
}
