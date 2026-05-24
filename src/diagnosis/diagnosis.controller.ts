import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoleType } from '@prisma/client';

import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

import { DiagnosisService } from './diagnosis.service';

import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('diagnosis')
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@GetUser() user: AuthenticatedUser, @Body() dto: CreateDiagnosisDto) {
    return this.diagnosisService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.diagnosisService.findAll(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMine(
    @GetUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.diagnosisService.findByUser(user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    return this.diagnosisService.findOneForUser(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDiagnosisDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.diagnosisService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    return this.diagnosisService.remove(id, user);
  }
}
