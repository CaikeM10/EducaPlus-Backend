import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { LearningPath } from '@prisma/client';

@Injectable()
export class RecommendationService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async generate(
    diagnosisId: string,
    result: string,
  ) {
    let learningPaths: LearningPath[] = [];

    if (result === 'AUTISM_SUPPORT') {
      learningPaths =
        await this.prisma.learningPath.findMany({
          where: {
            title: {
              contains: 'Autismo',
              mode: 'insensitive',
            },
          },
        });
    }

    if (result === 'TDAH_SUPPORT') {
      learningPaths =
        await this.prisma.learningPath.findMany({
          where: {
            title: {
              contains: 'TDAH',
              mode: 'insensitive',
            },
          },
        });
    }

    for (const path of learningPaths) {
      await this.prisma.recommendation.create({
        data: {
          diagnosisId,
          learningPathId: path.id,
          reason:
            'Recomendado com base no diagnóstico do usuário',
        },
      });
    }
  }

  findAll() {
    return this.prisma.recommendation.findMany({
      include: {
        diagnosis: true,
        learningPath: true,
        resource: true,
      },
    });
  }

  findByDiagnosis(
    diagnosisId: string,
  ) {
    return this.prisma.recommendation.findMany({
      where: {
        diagnosisId,
      },
      include: {
        learningPath: true,
        resource: true,
      },
    });
  }
}