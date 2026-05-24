import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

import { ResourceType } from '@prisma/client';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(ResourceType)
  type!: ResourceType;

  @IsString()
  @IsNotEmpty()
  @IsUrl({}, { message: 'Informe uma URL válida para o recurso' })
  url!: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @IsOptional()
  @IsString()
  thumbnail?: string;
}
