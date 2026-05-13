import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, ForbiddenException } from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { GetUser } from 'src/auth/get-user.decorator'
import { Roles } from 'src/auth/roles.decorator'
import { RolesGuard } from 'src/auth/roles.guard'

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body)
  }

  @UseGuards(RolesGuard)
  @Roles('SPECIAL_ED')
  @Get()
  findAll() {
    return this.userService.findAll()
  }

  @Get('me')
  getMe(@GetUser() user: any) {
    return user
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser() user: any,
  ) {
    if (user.userId !== id && user.role !== 'SPECIAL_ED') {
      throw new ForbiddenException('Acesso negado')
    }

    return this.userService.findOne(id)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @GetUser() user: any,
  ) {
    if (user.userId !== id && user.role !== 'SPECIAL_ED') {
      throw new ForbiddenException('Acesso negado')
    }

    return this.userService.update(id, body)
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser() user: any,
  ) {
    if (user.userId !== id && user.role !== 'SPECIAL_ED') {
      throw new ForbiddenException('Acesso negado')
    }

    return this.userService.remove(id)
  }
}