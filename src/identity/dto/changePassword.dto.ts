import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { IsValidPassword } from 'src/utils/decorators/validPassword.decorator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsValidPassword()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsValidPassword()
  newPassword: string;
}