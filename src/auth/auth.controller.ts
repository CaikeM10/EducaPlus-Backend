import { Body, Controller, Post, Get } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // TEMPORÁRIO
  @Get('generate-hash')
  async generateHash() {
    const hash = await bcrypt.hash('EducaPlus2026', 12);

    return {
      password: 'EducaPlus2026',
      hash,
    };
  }

  // TEMPORÁRIO
  @Get('reset-my-password')
  resetMyPassword() {
    return this.authService.resetPassword('caike@email.com', 'EducaPlus2026');
  }
}
