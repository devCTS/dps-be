import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';
import { IsValidPassword } from 'src/utils/decorators/validPassword.decorator';

export class CreateSubMerchantDto {
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
  phone?: string;

  @IsBoolean()
  @IsNotEmpty()
  enabled: boolean;

  @IsBoolean()
  @IsNotEmpty()
  permissionSubmitPayouts: boolean;

  @IsBoolean()
  @IsNotEmpty()
  permissionSubmitWithdrawals: boolean;

  @IsBoolean()
  @IsNotEmpty()
  permissionUpdateWithdrawalProfiles: boolean;
}
