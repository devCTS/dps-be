import { IsEnum, IsNotEmpty } from 'class-validator';
import { ChannelName, GatewayName, PaymentType } from 'src/utils/enum/enum';

export class GetChannelSettingsDto {
  @IsNotEmpty()
  @IsEnum(GatewayName)
  gatewayName: GatewayName;

  @IsNotEmpty()
  @IsEnum(PaymentType)
  type: PaymentType;

  @IsNotEmpty()
  @IsEnum(ChannelName)
  channelName: ChannelName;
}
