import { PartialType } from '@nestjs/mapped-types';
import { CreateMerchantDto } from './create-merchant.dto';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';
import { Type } from 'class-transformer';

export class UpdateMerchantDto extends PartialType(CreateMerchantDto) {
  @IsBoolean()
  @IsNotEmpty()
  updateLoginCredentials: boolean;

  @IsBoolean()
  @IsNotEmpty()
  updateWithdrawalCredentials: boolean;
}

export class UpdateMerchantChannelDto {
  @IsOptional()
  @Type(() => ChannelProfileDto)
  @ValidateNested({ each: true })
  channelProfile: ChannelProfileDto;
}
