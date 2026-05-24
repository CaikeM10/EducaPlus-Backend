import { Module } from '@nestjs/common';

import { RecommendationsController } from './recommendations.controller';
import { RecommendationService } from './recommendations.service';

import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RecommendationsController],
  providers: [RecommendationService, PrismaService],
  exports: [RecommendationService],
})
export class RecommendationsModule {}
