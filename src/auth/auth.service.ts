import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(name: string, email: string, password: string, role: string) {
    // 1. Verifica se já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException("Email já cadastrado");
    }

    // 2. Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const validRoles = ['TEACHER', 'COORDINATOR', 'SPECIAL_ED']; // ajuste conforme seus roles
    if (!validRoles.includes(role)) {
      throw new BadRequestException("Role inválido");
    }

    // 3. Cria usuário
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as any, // ajuste conforme seu enum de roles
      },
    });

    // 4. Gera token
    const payload = {
      sub: user.id,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    // 5. Retorna igual login
    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}