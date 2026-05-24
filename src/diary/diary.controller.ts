import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';

import { DiaryService } from './diary.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('diary')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Post()
  create(@Body() dto: CreateDiaryDto, @GetUser() user: AuthenticatedUser) {
    return this.diaryService.create(dto, user.id);
  }

  @Get()
  findAll(
    @GetUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.diaryService.findAllByUser(user.id, query);
  }

  @Get('lesson-plan/:lessonPlanId')
  findByLessonPlan(
    @Param('lessonPlanId') lessonPlanId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.diaryService.findByLessonPlan(lessonPlanId, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    return this.diaryService.remove(id, user.id);
  }
}
