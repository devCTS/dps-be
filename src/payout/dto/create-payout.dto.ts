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
} from 'src/utils/enum/enum';

export class CreatePayoutDto {
  @IsNotEmpty()
  @IsString()
  systemOrderId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus = OrderStatus.INITIATED;

  @IsEnum(ChannelName)
  @IsNotEmpty()
  channel: ChannelName;

  @IsEnum(NotificationStatus)
  @IsOptional()
  notificationStatus?: NotificationStatus = NotificationStatus.PENDING;

  @IsNotEmpty()
  @IsString()
  payoutMadeVia: string;

  @IsEnum(GatewayName)
  @IsOptional()
  gatewayName?: GatewayName;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  receipt?: string;

  @IsOptional()
  @IsPositive()
  @IsNumber()
  gatewayServiceRate?: number;

  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  merchantId: number;

  @IsOptional()
  memberId?: number;
}
