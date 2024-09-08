import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { IsValidPassword } from 'src/utils/decorators/validPassword.decorator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail(undefined, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsValidPassword()
  password: string;

  @IsString()
  @IsOptional()
  referralCode?: string;
}
