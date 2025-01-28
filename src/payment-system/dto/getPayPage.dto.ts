import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ChannelName, GatewayName } from 'src/utils/enum/enum';

export class GetPayPageDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  amount?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(GatewayName)
  gateway: GatewayName;

  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsEnum(ChannelName)
  channelName?: ChannelName;

  @IsOptional()
  @IsEnum(['live', 'sandbox'])
  environment?: 'live' | 'sandbox';
}
