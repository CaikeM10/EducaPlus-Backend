import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RoleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  createPaginatedResponse,
  getPagination,
} from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    const email = data.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new BadRequestException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await this.prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        password: hashedPassword,
        role: data.role ?? RoleType.TEACHER,
      },
    });

    return this.toPublicUser(user);
  }

  async findAll(query: PaginationQueryDto) {
    const { page, limit, skip, take } = getPagination(query);
    const where = {
      AND: [
        query.search
          ? {
              OR: [
                {
                  name: {
                    contains: query.search,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  email: {
                    contains: query.search,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            }
          : {},
        query.from || query.to
          ? {
              createdAt: {
                ...(query.from && { gte: new Date(query.from) }),
                ...(query.to && { lte: new Date(query.to) }),
              },
            }
          : {},
      ],
    };
    const allowed = ['createdAt', 'updatedAt', 'name', 'email', 'role'];
    const sort = allowed.includes(query.sort) ? query.sort : 'createdAt';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { [sort]: query.order },
        skip,
        take,
      }),
      this.prisma.user.count({ where }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async updateProfile(id: string, data: UpdateProfileDto) {
    const updateData: UpdateProfileDto = {};

    if (data.name) updateData.name = data.name.trim();
    if (data.email) updateData.email = data.email.trim().toLowerCase();

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.toPublicUser(user);
  }

  async adminUpdate(id: string, data: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.email && { email: data.email.trim().toLowerCase() }),
        ...(data.role && { role: data.role }),
      },
    });

    return this.toPublicUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const passwordMatch = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Senha atual inválida');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Senha alterada com sucesso' };
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  private toPublicUser(user: {
    id: string;
    name: string;
    email: string;
    role: RoleType;
    createdAt: Date;
    updatedAt?: Date;
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
