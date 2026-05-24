import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateProgressDto {
  @IsString()
  @IsNotEmpty()
  stepId!: string;

  @IsBoolean()
  completed!: boolean;
}
