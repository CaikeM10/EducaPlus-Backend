import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('recent-activity')
  getRecentActivity(@GetUser() user: AuthenticatedUser) {
    return this.dashboardService.getRecentActivity(user.id);
  }
}
