import {
  IsObject,
  IsNotEmpty,
} from 'class-validator';

export class CreateDiagnosisDto {
  @IsObject()
  @IsNotEmpty()
  answers!: Record<string, string>;
}