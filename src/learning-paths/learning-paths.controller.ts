import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { LearningPathService } from './learning-paths.service';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { UpdateProgressDto } from './dto/progress.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { FilterLearningPathDto } from './dto/filter-learning-path.dto';

@Controller('learning-paths')
export class LearningPathController {
  constructor(private service: LearningPathService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreateLearningPathDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.service.create(dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @GetUser() user: AuthenticatedUser,
    @Query() query: FilterLearningPathDto,
  ) {
    return this.service.findAll(user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('with-progress')
  getWithProgress(
    @GetUser() user: AuthenticatedUser,
    @Query() query: FilterLearningPathDto,
  ) {
    return this.service.getLearningPathsWithProgress(user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    return this.service.findOne(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('progress')
  updateProgress(
    @Body() dto: UpdateProgressDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.service.updateProgress(user.id, dto);
  }
}
