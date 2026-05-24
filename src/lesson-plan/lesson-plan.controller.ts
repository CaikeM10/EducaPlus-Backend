import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';

import { LessonPlanService } from './lesson-plan.service';
import { CreateLessonPlanDto } from './dto/create-lesson-plan.dto';
import { UpdateLessonPlanDto } from './dto/update-lesson-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('lesson-plans')
export class LessonPlanController {
  constructor(private readonly lessonPlanService: LessonPlanService) {}

  @Post()
  create(@Body() dto: CreateLessonPlanDto, @GetUser() user: AuthenticatedUser) {
    return this.lessonPlanService.create(dto, user.id);
  }

  @Get()
  findAll(
    @GetUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.lessonPlanService.findAllByUser(user.id, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    return this.lessonPlanService.findOne(id, user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLessonPlanDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.lessonPlanService.update(id, dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    return this.lessonPlanService.remove(id, user.id);
  }
}
