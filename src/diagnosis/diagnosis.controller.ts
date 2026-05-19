import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { DiagnosisService } from './diagnosis.service';

import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';

@Controller('diagnosis')
export class DiagnosisController {
  constructor(
    private readonly diagnosisService: DiagnosisService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req,
    @Body() dto: CreateDiagnosisDto,
  ) {
    return this.diagnosisService.create(
      req.user.userId,
      dto,
    );
  }

  @Get()
  findAll() {
    return this.diagnosisService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req) {
    return this.diagnosisService.findByUser(
      req.user.userId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diagnosisService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDiagnosisDto,
  ) {
    return this.diagnosisService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.diagnosisService.remove(id);
  }
}