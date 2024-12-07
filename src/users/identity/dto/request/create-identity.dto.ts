import { IsBoolean, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { IsValidPassword } from 'src/utils/decorators/validPassword.decorator';
import { IsValidPhoneNumber } from 'src/utils/decorators/validPhoneNumber';

export class CreateIdentityDto {
  @IsEmail()
  email: string;

  @IsValidPassword()
  password: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsValidPhoneNumber()
  phone: string;

  @IsOptional()
  @IsBoolean()
  enabled: boolean;
}
