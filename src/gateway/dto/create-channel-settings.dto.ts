import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ChannelName, GatewayName, PaymentType } from 'src/utils/enum/enum';

export class CreateChannelSettingsDto {
  @IsNotEmpty()
  @IsEnum(GatewayName)
  gateway_name: GatewayName;

  @IsNotEmpty()
  @IsEnum(PaymentType)
  type: PaymentType;

  @IsNotEmpty()
  @IsEnum(ChannelName)
  channel_name: ChannelName;

  @IsNotEmpty()
  @IsBoolean()
  enabled: boolean;

  @IsNotEmpty()
  @IsNumber()
  min_amount: number;

  @IsNotEmpty()
  @IsNumber()
  max_amount: number;

  @IsNotEmpty()
  @IsNumber()
  upstream_fee: number;
}

export class UpdateChannelSettingsDto extends PartialType(
  CreateChannelSettingsDto,
) {}
