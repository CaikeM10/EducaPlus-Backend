import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module'
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LearningPathsModule } from './learning-paths/learning-paths.module';
import { ResourcesModule } from './resources/resources.module';
import { LessonPlanModule } from './lesson-plan/lesson-plan.module';
import { DiaryModule } from './diary/diary.module';
import { CategoriesModule } from './categories/categories.module';
import { DiagnosisModule } from './diagnosis/diagnosis.module';
import { RecommendationsModule } from './recommendations/recommendations.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, LearningPathsModule, ResourcesModule, LessonPlanModule, DiaryModule, CategoriesModule, DiagnosisModule, RecommendationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
