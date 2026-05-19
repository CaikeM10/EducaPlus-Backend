import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { RecommendationService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationService: RecommendationService,
  ) {}

  @Get()
  findAll() {
    return this.recommendationService.findAll();
  }

  @Get(':diagnosisId')
  findByDiagnosis(
    @Param('diagnosisId') diagnosisId: string,
  ) {
    return this.recommendationService.findByDiagnosis(
      diagnosisId,
    );
  }
}