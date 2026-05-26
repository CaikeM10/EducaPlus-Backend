import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LearningPathsModule } from './learning-paths/learning-paths.module';
import { ResourcesModule } from './resources/resources.module';
import { LessonPlanModule } from './lesson-plan/lesson-plan.module';
import { DiaryModule } from './diary/diary.module';
import { CategoriesModule } from './categories/categories.module';
import { DiagnosisModule } from './diagnosis/diagnosis.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { HealthModule } from './health/health.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProgressModule } from './progress/progress.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    AuthModule,
    LearningPathsModule,
    ResourcesModule,
    LessonPlanModule,
    DiaryModule,
    CategoriesModule,
    DiagnosisModule,
    RecommendationsModule,
    HealthModule,
    DashboardModule,
    ProgressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
