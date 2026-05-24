import { LearningCategory, LearningLevel } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class FilterLearningPathDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(LearningCategory)
  category?: LearningCategory;

  @IsOptional()
  @IsEnum(LearningLevel)
  level?: LearningLevel;
}
