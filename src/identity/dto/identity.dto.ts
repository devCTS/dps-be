import { IsEmail, isNotEmpty, IsNotEmpty, IsString } from 'class-validator';

export class IdentityRegisterDto {
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
