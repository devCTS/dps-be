import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class IdentityRegisterDto {
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum([
    'admin',
    'sub-admin',
    'super-admin',
    'merchant',
    'sub-merchant',
    'member',
  ])
  @IsNotEmpty()
  user_type: string;
}

export class IdentitySigninDto {
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
