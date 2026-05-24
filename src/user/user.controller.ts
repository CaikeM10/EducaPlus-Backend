import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Post()
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.userService.findAll(query);
  }

  @Get('me')
  getMe(@GetUser() user: AuthenticatedUser) {
    return this.userService.findOne(user.id);
  }

  @Patch('me')
  updateMe(@GetUser() user: AuthenticatedUser, @Body() body: UpdateProfileDto) {
    return this.userService.updateProfile(user.id, body);
  }

  @Patch('me/password')
  changePassword(
    @GetUser() user: AuthenticatedUser,
    @Body() body: ChangePasswordDto,
  ) {
    return this.userService.changePassword(user.id, body);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    if (user.id !== id && user.role !== RoleType.ADMIN) {
      throw new ForbiddenException('Acesso negado');
    }

    return this.userService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.adminUpdate(id, body);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
