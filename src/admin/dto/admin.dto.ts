import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AdminRegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches('^[A-Za-z]+(?: [A-Za-z]+)*$')
  @MinLength(3)
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @Matches('^[A-Za-z]+(?: [A-Za-z]+)*$')
  @MinLength(3)
  last_name: string;

  @IsString()
  @IsNotEmpty()
  @Matches('^[a-z0-9_]{4,16}$')
  user_name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(16)
  @Matches('^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,}$')
  password: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(['super', 'sub', 'admin'])
  @IsNotEmpty()
  type: string;

  @IsArray()
  @IsOptional()
  privilages: string;

  @IsBoolean()
  @IsNotEmpty()
  enable: boolean;
}

export class SignInDto {
  @IsString()
  @IsNotEmpty()
  @Matches('^[a-z0-9_]{4,16}$')
  user_name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(16)
  @Matches('^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,}$')
  password: string;
}
