import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
  Min,
  IsNotEmpty,
  IsEmail,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsIP,
  IsInt,
  IsIn,
} from 'class-validator';
import { IsValidPassword } from 'src/utils/decorators/validPassword.decorator';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';

export class RangeDto {
  @IsInt()
  @IsNotEmpty()
  lower: number;

  @IsInt()
  @IsNotEmpty()
  upper: number;

  @IsIn(['member', 'phonepe', 'razorpay'])
  @IsNotEmpty()
  gateway: string;
}

export class RatioDto {
  @IsInt()
  @IsNotEmpty()
  ratio: number;

  @IsIn(['member', 'phonepe', 'razorpay'])
  @IsNotEmpty()
  gateway: string;
}
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

  // @IsString()
  // @IsNotEmpty()
  // integrationId: string;

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

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  payinChannels: number[];

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  payoutChannels: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChannelProfileDto)
  channelProfile: ChannelProfileDto[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsIP(undefined, { each: true })
  ipAddresses: string[];

  @IsEnum(['DEFAULT', 'PROPORTIONAL', 'AMOUNT RANGE'])
  @IsNotEmpty()
  payinMode: 'DEFAULT' | 'PROPORTIONAL' | 'AMOUNT RANGE' = 'DEFAULT'; // Default value

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  numberOfRangesOrRatio?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RangeDto)
  amountRanges: RangeDto[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RatioDto)
  ratios: RatioDto[];
}
