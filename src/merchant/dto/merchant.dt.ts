import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class MerchantRegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsPhoneNumber()
  phone: string;
}

export class MerchantSigninDto {
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
