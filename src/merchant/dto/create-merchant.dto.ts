import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
  Min,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';
import { IsValidPassword } from 'src/utils/decorators/validPassword.decorator';

export class CreateMerchantDto {
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

  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  referralCode?: string;

  @IsBoolean()
  @IsNotEmpty()
  enabled: boolean;

  @IsString()
  @IsNotEmpty()
  @IsValidPassword()
  withdrawalPassword: string;

  @IsString()
  @IsNotEmpty()
  integrationId: string;

  @IsString()
  @IsNotEmpty()
  businessUrl: string;

  @IsBoolean()
  @IsNotEmpty()
  allowMemberChannelsPayin: boolean;

  @IsBoolean()
  @IsNotEmpty()
  allowPgBackupForPayin: boolean;

  @IsBoolean()
  @IsNotEmpty()
  allowMemberChannelsPayout: boolean;

  @IsBoolean()
  @IsNotEmpty()
  allowPgBackupForPayout: boolean;

  @IsNumber()
  @Min(0)
  payinServiceRate: number;

  @IsNumber()
  @Min(0)
  payoutServiceRate: number;

  @IsNumber()
  @Min(0)
  withdrawalServiceRate: number;

  @IsNumber()
  @Min(0)
  minPayout: number;

  @IsNumber()
  @Min(0)
  maxPayout: number;

  @IsNumber()
  @Min(0)
  minWithdrawal: number;

  @IsNumber()
  @Min(0)
  maxWithdrawal: number;

  @IsEnum(['DEFAULT', 'PROPORTIONAL', 'AMOUNT_RANGE'])
  @IsNotEmpty()
  payinMode: 'DEFAULT' | 'PROPORTIONAL' | 'AMOUNT_RANGE' = 'DEFAULT'; // Default value
}
