import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDiaryDto {
  @IsString()
  @IsNotEmpty()
  lessonPlanId!: string;

  @IsString()
  @IsNotEmpty()
  whatWorked!: string;

  @IsOptional()
  @IsString()
  whatFailed?: string;

  @IsOptional()
  @IsString()
  studentResponse?: string;

  @IsOptional()
  @IsString()
  inclusionReflection?: string;
}
