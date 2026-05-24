import { RoleType } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  NotEquals,
} from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'O nome deve ser um texto' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name!: string;

  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email!: string;

  @IsString({ message: 'A senha deve ser um texto' })
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'A senha deve conter letras e números',
  })
  password!: string;

  @IsEnum(RoleType, { message: 'Perfil de usuário inválido' })
  @NotEquals(RoleType.ADMIN, {
    message: 'Cadastro público não permite perfil ADMIN',
  })
  role!: RoleType;
}
