import {
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsNotEmpty,
  IsEnum
} from 'class-validator'

import { Type } from 'class-transformer'
import { ResourceType, LearningLevel, LearningCategory } from '@prisma/client'

/* =========================
   RESOURCE DTO
========================= */
class CreateContentDto {
  @IsString()
  @IsNotEmpty()
  title!: string

  @IsString()
  @IsNotEmpty()
  description!: string

  @IsEnum(ResourceType)
  type!: ResourceType

  @IsString()
  @IsNotEmpty()
  url!: string

  @IsString()
  @IsNotEmpty()
  categoryId!: string
}

/* =========================
   STEP DTO
========================= */
class CreateStepDto {
  @IsString()
  @IsNotEmpty()
  title!: string

  @IsString()
  description?: string

  @IsNumber()
  position!: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContentDto)
  resources!: CreateContentDto[]
}

/* =========================
   MAIN DTO
========================= */
export class CreateLearningPathDto {
  @IsString()
  @IsNotEmpty()
  title!: string

  @IsString()
  @IsNotEmpty()
  description!: string

  @IsEnum(LearningLevel)
  level!: LearningLevel

  @IsEnum(LearningCategory)
  category!: LearningCategory

  @IsString()
  duration?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStepDto)
  steps!: CreateStepDto[]
}