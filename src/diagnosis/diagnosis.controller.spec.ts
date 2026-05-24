import { Test, TestingModule } from '@nestjs/testing';
import { DiagnosisController } from './diagnosis.controller';
import { DiagnosisService } from './diagnosis.service';

describe('DiagnosisController', () => {
  let controller: DiagnosisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiagnosisController],
      providers: [
        {
          provide: DiagnosisService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByUser: jest.fn(),
            findOneForUser: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DiagnosisController>(DiagnosisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
