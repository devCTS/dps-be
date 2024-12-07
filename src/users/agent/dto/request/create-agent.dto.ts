import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateIdentityDto } from 'src/users/identity/dto/request/create-identity.dto';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';

export class CreateAgentDto extends CreateIdentityDto {
  @IsString()
  withdrawalPassword: string;

  @IsNumber()
  withdrawalRate: number;

  @IsNumber()
  minWithdrawalAmount: number;

  @IsNumber()
  maxWithdrawalAmount: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelProfileDto)
  channelProfile: ChannelProfileDto;

  @IsOptional()
  referralCode?: string;
}
