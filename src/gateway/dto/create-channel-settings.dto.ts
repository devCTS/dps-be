import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ChannelName, GatewayName, PaymentType } from 'src/utils/enum/enum';

export class CreateChannelSettingsDto {
  @IsNotEmpty()
  @IsEnum(GatewayName)
  gatewayName: GatewayName;

  @IsNotEmpty()
  @IsEnum(PaymentType)
  type: PaymentType;

  @IsNotEmpty()
  @IsEnum(ChannelName)
  channelName: ChannelName;

  @IsNotEmpty()
  @IsBoolean()
  enabled: boolean;

  @IsNotEmpty()
  @IsNumber()
  minAmount: number;

  @IsNotEmpty()
  @IsNumber()
  maxAmount: number;

  @IsNotEmpty()
  @IsNumber()
  upstreamFee: number;
}

export class UpdateChannelSettingsDto extends PartialType(
  CreateChannelSettingsDto,
) {}
