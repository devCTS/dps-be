import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsValidPassword } from 'src/utils/decorators/validPassword.decorator';
import { IsValidPhoneNumber } from 'src/utils/decorators/validPhoneNumber';

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail(undefined, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsValidPassword()
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  @IsValidPhoneNumber()
  phone: string;

  @IsString()
  @IsOptional()
  referralCode: string;
}
