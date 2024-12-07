import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateIdentityDto } from 'src/users/identity/dto/request/create-identity.dto';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';
import { AdminRoles } from 'src/utils/enums/users';

export class CreateMemberDto extends CreateIdentityDto {
  @IsNumber()
  payinCommissionRate: number;

  @IsNumber()
  payoutCommissionRate: number;

  @IsNumber()
  singlePayoutUpperLimit: number;

  @IsNumber()
  singlePayoutLowerLimit: number;

  @IsNumber()
  dailyTotalPayoutLimit: number;

  @IsOptional()
  @IsString()
  telegramId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelProfileDto)
  channelProfile: ChannelProfileDto;

  @IsOptional()
  referralCode?: string;
}
