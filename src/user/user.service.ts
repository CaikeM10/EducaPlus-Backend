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
import { Achievement, AchievementType } from './types/achievement.type';

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
          lastLoginAt: true,
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
        lastLoginAt: true,
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

  async getAchievements(userId: string): Promise<Achievement[]> {
    const [
      allLearningPaths,
      completedLearningPathIds,
      lessonPlansCount,
      diariesCount,
      downloadsCount,
      loginEvents,
    ] = await Promise.all([
      this.prisma.learningPath.findMany({
        select: {
          id: true,
          steps: {
            select: {
              id: true,
              progress: {
                where: {
                  userId,
                  completed: true,
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      }),
      this.getCompletedLearningPathIds(userId),
      this.prisma.lessonPlan.count({ where: { userId } }),
      this.prisma.diary.count({ where: { userId } }),
      this.prisma.resourceDownload.count({ where: { userId } }),
      this.prisma.loginEvent.findMany({
        where: { userId },
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const completedPathsCount = completedLearningPathIds.length;
    const totalPathsWithSteps = allLearningPaths.filter(
      (path) => path.steps.length > 0,
    ).length;
    const loginStreak = this.calculateLoginStreak(loginEvents);

    return [
      this.createAchievement(
        AchievementType.FIRST_STEPS,
        'Primeiros Passos',
        'Completou sua primeira trilha de aprendizado',
        completedPathsCount,
        1,
      ),
      this.createAchievement(
        AchievementType.DEDICATED_LEARNER,
        'Aprendiz Dedicado',
        'Logou por 7 dias seguidos',
        loginStreak,
        7,
      ),
      this.createAchievement(
        AchievementType.PLANNING_MASTER,
        'Mestre do Planejamento',
        'Criou 10 planos de aula',
        lessonPlansCount,
        10,
      ),
      this.createAchievement(
        AchievementType.REFLECTIVE_PROFESSIONAL,
        'Profissional Reflexivo',
        'Adicionou 5 entradas no diário',
        diariesCount,
        5,
      ),
      this.createAchievement(
        AchievementType.KNOWLEDGE_SEEKER,
        'Buscador de Conhecimento',
        'Baixou 10 recursos',
        downloadsCount,
        10,
      ),
      this.createAchievement(
        AchievementType.MASTER_TEACHER,
        'Professor Mestre',
        'Completou todas as trilhas de aprendizado',
        completedPathsCount,
        Math.max(totalPathsWithSteps, 1),
      ),
    ];
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

  private async getCompletedLearningPathIds(userId: string) {
    const paths = await this.prisma.learningPath.findMany({
      select: {
        id: true,
        steps: {
          select: {
            id: true,
            progress: {
              where: {
                userId,
                completed: true,
              },
              select: { id: true },
            },
          },
        },
      },
    });

    return paths
      .filter(
        (path) =>
          path.steps.length > 0 &&
          path.steps.every((step) => step.progress.length > 0),
      )
      .map((path) => path.id);
  }

  private createAchievement(
    type: AchievementType,
    title: string,
    description: string,
    current: number,
    target: number,
  ): Achievement {
    const safeTarget = Math.max(target, 1);

    return {
      type,
      title,
      description,
      current: Math.min(current, safeTarget),
      target: safeTarget,
      achieved: current >= safeTarget,
    };
  }

  private calculateLoginStreak(events: Array<{ createdAt: Date }>) {
    const loginDays = new Set(
      events.map((event) => event.createdAt.toISOString().slice(0, 10)),
    );

    let streak = 0;
    const cursor = new Date();

    while (loginDays.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    return streak;
  }

  private toPublicUser(user: {
    id: string;
    name: string;
    email: string;
    role: RoleType;
    createdAt: Date;
    updatedAt?: Date;
    lastLoginAt?: Date | null;
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      isReturningUser:
        user.lastLoginAt !== null && user.lastLoginAt !== undefined,
    };
  }
}
