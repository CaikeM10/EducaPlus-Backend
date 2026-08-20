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

    console.log('================ LOGIN DEBUG =================');
    console.log('EMAIL:', email);
    console.log('PASSWORD RAW:', JSON.stringify(dto.password));

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    console.log('USER EXISTS:', !!user);

    if (!user) {
      console.log('USUARIO NÃO ENCONTRADO');
      throw new UnauthorizedException('Credenciais inválidas');
    }

    console.log('USER EMAIL:', user.email);
    console.log('HASH BANCO:', user.password);

    const passwordMatch = await bcrypt.compare(dto.password, user.password);

    console.log('PASSWORD MATCH:', passwordMatch);

    const generatedHash = await bcrypt.hash(dto.password, 12);

    console.log('HASH GERADO AGORA:', generatedHash);

    console.log('================================================');

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
