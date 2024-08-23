import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class MerchantRegistrationDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
