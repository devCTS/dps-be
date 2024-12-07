import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { CreateIdentityDto } from 'src/users/identity/dto/request/create-identity.dto';
import { FeeModeDetailsDto } from 'src/utils/dtos/fee-mode.dto';
import { PayinModeDetailsDto } from 'src/utils/dtos/payin-mode.dto';
import { Channels } from 'src/utils/enums/channels';

import { Type } from 'class-transformer';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';

export class CreateMerchantDto extends CreateIdentityDto {
  @IsUrl()
  businessUrl: string;

  @IsString()
  businessName: string;

  @IsString()
  withdrawalPassword: string;

  @IsBoolean()
  allowMemberChannelsPayin: boolean;

  @IsBoolean()
  allowPgBackupForPayin: boolean;

  @IsBoolean()
  allowMemberChannelsPayout: boolean;

  @IsBoolean()
  allowPgBackupForPayout: boolean;

  @ValidateNested()
  @Type(() => FeeModeDetailsDto)
  payinServiceRate: FeeModeDetailsDto;

  @ValidateNested()
  @Type(() => FeeModeDetailsDto)
  payoutServiceRate: FeeModeDetailsDto;

  @ValidateNested()
  @Type(() => FeeModeDetailsDto)
  withdrawalServiceRate: FeeModeDetailsDto;

  @IsNumber()
  minPayout: number;

  @IsNumber()
  maxPayout: number;

  @IsNumber()
  minWithdrawal: number;

  @IsNumber()
  maxWithdrawal: number;

  @IsArray()
  @IsEnum(Channels, { each: true })
  payinChannels: Channels[];

  @IsArray()
  @IsEnum(Channels, { each: true })
  payoutChannels: Channels;

  @ValidateNested()
  @Type(() => FeeModeDetailsDto)
  payinMode: PayinModeDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelProfileDto)
  channelProfile: ChannelProfileDto;
}
