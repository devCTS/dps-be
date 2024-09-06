import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class SubMerchantRegisterDto {
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

export class SubMerchantSigninDto {
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SubMerchantUpdateDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  first_name?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  last_name?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
}
