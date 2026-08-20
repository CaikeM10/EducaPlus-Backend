import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    console.log('================ LOGIN DEBUG ================');
    console.log('EMAIL RECEBIDO:', email);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    console.log('USUARIO ENCONTRADO:', user?.email);
    console.log('HASH BANCO:', user?.password);

    if (!user) {
      console.log('USUARIO NÃO ENCONTRADO');
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);

    console.log('SENHA DIGITADA:', dto.password);
    console.log('PASSWORD MATCH:', passwordMatch);
    console.log('============================================');

    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isReturningUser = user.lastLoginAt !== null;

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    await this.recordLogin(user.id);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        isReturningUser,
      },
    };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const name = dto.name.trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já cadastrado');
    }

    if (dto.role === RoleType.ADMIN) {
      throw new BadRequestException(
        'Cadastro público não permite perfil ADMIN',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: dto.role,
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    await this.recordLogin(user.id);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        isReturningUser: false,
      },
    };
  }

  // TEMPORÁRIO: usar apenas para recuperar a conta.
  async resetPassword(email: string, newPassword: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: 'Senha redefinida com sucesso.',
    };
  }

  private async recordLogin(userId: string) {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() },
      }),

      this.prisma.loginEvent.create({
        data: { userId },
      }),
    ]);
  }
}
