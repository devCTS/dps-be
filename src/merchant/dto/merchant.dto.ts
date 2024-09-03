import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ServiceRateDto } from './serviceRate.dto';
import { PayoutLimitDto } from './payoutLimit.dto';

export class MerchantRegistrationDto {
  @IsString()
  @IsNotEmpty()
  @Matches('^[A-Za-z]+(?: [A-Za-z]+)*$')
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Matches('^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$')
  business_name: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  business_urls: string[];

  @IsString()
  @IsNotEmpty()
  @Matches('^[a-z0-9_]{4,16}$')
  user_name: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(16)
  @Matches('^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,}$')
  login_password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(16)
  @Matches('^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,}$')
  withdrawal_password: string;

  @IsNumber()
  balance: number;

  @IsBoolean()
  @IsOptional()
  allow_member_channel_payin: boolean;

  @IsBoolean()
  @IsOptional()
  allow_payin_timeout_fallback: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => ServiceRateDto)
  payin_service_rate: ServiceRateDto;

  @IsObject()
  @ValidateNested()
  @Type(() => ServiceRateDto)
  payout_service_rate: ServiceRateDto;

  @IsObject()
  @ValidateNested()
  @Type(() => PayoutLimitDto)
  payout_limit: PayoutLimitDto;

  @IsBoolean()
  allow_member_channel_payout: boolean;

  @IsBoolean()
  allow_payout_timeout_fallback: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => ServiceRateDto)
  withdrawal_service_rate: ServiceRateDto;

  @IsNumber()
  min_withdrawal: string;

  @IsNumber()
  max_withdrawal: string;

  @IsString()
  @Matches('^[A-Za-z]+(?: [A-Za-z]+)*$')
  @MinLength(3)
  agent: string;

  @IsBoolean()
  status: boolean;

  @IsOptional()
  @IsArray()
  ip_restriction: string[];

  @IsEnum(['Default', 'Proportional', 'Range'])
  @IsOptional()
  channel_mode: string;

  // TODO
  // sub_accounts: string;
}
