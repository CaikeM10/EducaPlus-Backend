import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';

import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { FilterResourceDto } from './dto/filter-resource.dto';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateResourceDto, @GetUser() user: AuthenticatedUser) {
    return this.resourcesService.create(dto, user.id);
  }

  @Get()
  findAll(@Query() filters: FilterResourceDto) {
    return this.resourcesService.findAllPaginated(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/download')
  recordDownload(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    return this.resourcesService.recordDownload(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateResourceDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.resourcesService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    return this.resourcesService.remove(id, user);
  }
}
