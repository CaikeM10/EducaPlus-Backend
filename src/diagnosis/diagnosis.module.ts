import { Module } from '@nestjs/common';

import { DiagnosisController } from './diagnosis.controller';
import { DiagnosisService } from './diagnosis.service';

import { PrismaService } from '../prisma/prisma.service';

import { RecommendationsModule } from '../recommendations/recommendations.module';

@Module({
  imports: [RecommendationsModule],
  controllers: [DiagnosisController],
  providers: [
    DiagnosisService,
    PrismaService,
  ],
})
export class DiagnosisModule {}