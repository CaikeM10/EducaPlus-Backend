import { Injectable } from '@nestjs/common';

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

  async create(
    userId: string,
    dto: CreateDiagnosisDto,
  ) {
    const result = this.analyzeAnswers(dto.answers);

    const diagnosis =
      await this.prisma.diagnosis.create({
        data: {
          userId,
          answers: dto.answers,
          result,
        },
      });

    await this.recommendationService.generate(
      diagnosis.id,
      result,
    );

    return diagnosis;
  }

  private analyzeAnswers(
    answers: Record<string, string>,
  ) {
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

  findAll() {
    return this.prisma.diagnosis.findMany({
      include: {
        recommendations: true,
      },
    });
  }

  findByUser(userId: string) {
    return this.prisma.diagnosis.findMany({
      where: {
        userId,
      },
      include: {
        recommendations: {
          include: {
            learningPath: true,
            resource: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.diagnosis.findUnique({
      where: { id },
      include: {
        recommendations: true,
      },
    });
  }

  update(
    id: string,
    dto: UpdateDiagnosisDto,
  ) {
    return this.prisma.diagnosis.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.diagnosis.delete({
      where: { id },
    });
  }
}