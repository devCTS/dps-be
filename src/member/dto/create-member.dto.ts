import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  Min,
  IsNotEmpty,
  IsNumber,
  IsEmail,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { IsValidPassword } from 'src/utils/decorators/validPassword.decorator';
import { IsValidPhoneNumber } from 'src/utils/decorators/validPhoneNumber';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';

export class CreateMemberDto {
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

  @IsOptional()
  @IsString()
  // @IsValidPhoneNumber()
  phone?: string;

  @IsString()
  telegramId: string;

  @IsString()
  @IsOptional()
  referralCode?: string;

  @IsBoolean()
  @IsNotEmpty()
  enabled: boolean;

  @IsNumber()
  @Min(0)
  payinCommissionRate: number;

  @IsNumber()
  @Min(0)
  payoutCommissionRate: number;

  @IsNumber()
  @Min(0)
  topupCommissionRate: number;

  @IsNumber()
  @Min(0)
  singlePayoutUpperLimit: number;

  @IsNumber()
  @Min(0)
  singlePayoutLowerLimit: number;

  @IsNumber()
  @Min(0)
  dailyTotalPayoutLimit: number;

  @IsNumber()
  withdrawalRate: number;

  @IsNumber()
  minWithdrawalAmount: number;

  @IsNumber()
  maxWithdrawalAmount: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChannelProfileDto)
  channelProfile: ChannelProfileDto[];
}
