import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { LearningProgressService } from './learning-progress.service';
import { ProgressCalculatorService } from './progress-calculator.service';
import { ProgressPresenter } from './progress.presenter';

@Module({
  imports: [PrismaModule],
  providers: [
    LearningProgressService,
    ProgressCalculatorService,
    ProgressPresenter,
  ],
  exports: [
    LearningProgressService,
    ProgressCalculatorService,
    ProgressPresenter,
  ],
})
export class ProgressModule {}