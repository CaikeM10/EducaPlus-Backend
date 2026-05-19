import { IsOptional, IsString } from 'class-validator'

export class FilterResourceDto {
  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsString()
  search?: string
}