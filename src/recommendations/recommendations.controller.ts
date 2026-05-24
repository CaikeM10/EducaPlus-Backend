import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RoleType } from '@prisma/client';

import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RecommendationService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.recommendationService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':diagnosisId')
  findByDiagnosis(
    @Param('diagnosisId') diagnosisId: string,
    @GetUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.recommendationService.findByDiagnosis(diagnosisId, user, query);
  }
}
