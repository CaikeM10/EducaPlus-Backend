import { Test, TestingModule } from '@nestjs/testing';
import { LearningPathController } from './learning-paths.controller';
import { LearningPathService } from './learning-paths.service';

describe('LearningPathController', () => {
  let controller: LearningPathController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningPathController],
      providers: [
        {
          provide: LearningPathService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            getLearningPathsWithProgress: jest.fn(),
            updateProgress: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LearningPathController>(LearningPathController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
