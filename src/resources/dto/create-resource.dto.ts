import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString
} from 'class-validator'

import { ResourceType } from '@prisma/client'

export class CreateResourceDto {
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

  @IsArray()
  tags!: string[]
}