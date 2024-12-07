import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { IsValidPassword } from 'src/utils/decorators/validPassword.decorator';

export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail(undefined, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsValidPassword()
  password: string;
}
