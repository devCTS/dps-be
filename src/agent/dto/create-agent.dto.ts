import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { IsValidPassword } from 'src/utils/decorators/validPassword.decorator';
import { IsValidPhoneNumber } from 'src/utils/decorators/validPhoneNumber';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';

export class CreateAgentDto {
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
  phone: string;

  @IsBoolean()
  @IsNotEmpty()
  enabled: boolean;

  @IsString()
  @IsNotEmpty()
  @IsValidPassword()
  withdrawalPassword: string;

  @IsNumber()
  @IsNotEmpty()
  withdrawalRate: number;

  @IsNumber()
  @IsNotEmpty()
  minWithdrawalAmount: number;

  @IsNumber()
  @IsNotEmpty()
  maxWithdrawalAmount: number;

  @IsOptional()
  @Type(() => ChannelProfileDto)
  @ValidateNested({ each: true })
  channelProfile: ChannelProfileDto;

  @IsOptional()
  @IsNumber()
  agentId: number;

  @IsOptional()
  @IsNumber()
  agentPayinCommissionRate: number;

  @IsOptional()
  @IsNumber()
  agentPayoutCommissionRate: number;
}
