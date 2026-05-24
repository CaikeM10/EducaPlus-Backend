import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateLessonPlanDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strategies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  inclusions?: string[];
}
