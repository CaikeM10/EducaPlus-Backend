import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RecommendationService } from '../recommendations/recommendations.service';
import { DiagnosisService } from './diagnosis.service';

describe('DiagnosisService', () => {
  let service: DiagnosisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiagnosisService,
        { provide: PrismaService, useValue: {} },
        { provide: RecommendationService, useValue: { generate: jest.fn() } },
      ],
    }).compile();

    service = module.get<DiagnosisService>(DiagnosisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
