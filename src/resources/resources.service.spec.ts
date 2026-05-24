import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ResourcesService } from './resources.service';

describe('ResourcesService', () => {
  let service: ResourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResourcesService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<ResourcesService>(ResourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
