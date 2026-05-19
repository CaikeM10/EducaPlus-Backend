import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
  Query
} from '@nestjs/common'

import { AuthGuard } from '@nestjs/passport'

import { ResourcesService } from './resources.service'
import { CreateResourceDto } from './dto/create-resource.dto'
import { UpdateResourceDto } from './dto/update-resource.dto'
import { FilterResourceDto } from './dto/filter-resource.dto'

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() dto: CreateResourceDto,
    @Req() req
  ) {

    console.log(req.user)
    
    return this.resourcesService.create(dto, req.user.userId)
  }

  @Get()
  findAll(@Query() filters: FilterResourceDto) {
    return this.resourcesService.findAll(filters)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id)
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateResourceDto
  ) {
    return this.resourcesService.update(id, dto)
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resourcesService.remove(id)
  }
}