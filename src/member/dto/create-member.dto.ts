import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
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

  @IsString()
  @IsOptional()
  @IsValidPhoneNumber()
  phone?: string;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChannelProfileDto)
  channelProfile: ChannelProfileDto[];
}
