import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsNumber,
} from 'class-validator';
import {
  ChannelName,
  GatewayName,
  NotificationStatus,
  OrderStatus,
  PaymentMadeOn,
} from 'src/utils/enum/enum';

export class CreatePayoutDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(ChannelName)
  channel: ChannelName;

  @IsNotEmpty()
  @IsString()
  channelDetails: string;

  @IsNotEmpty()
  @IsEnum(PaymentMadeOn)
  payoutMadeVia: PaymentMadeOn;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  mobile: string;

  @IsNotEmpty()
  @IsNumber()
  merchantId: number;

  @IsOptional()
  @IsNumber()
  memberId?: number;
}
