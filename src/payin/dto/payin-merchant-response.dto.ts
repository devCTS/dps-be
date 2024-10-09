import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  CallBackStatus,
  ChannelName,
  GatewayName,
  OrderStatus,
  PaymentMadeOn,
} from 'src/utils/enum/enum';

export class PayinMerchantResponseDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  systemOrderId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsNotEmpty()
  @IsEnum(ChannelName)
  channel: ChannelName;

  @IsNotEmpty()
  @IsString()
  user: string;

  @IsOptional()
  @IsNumber()
  balanceCredit: number;

  @IsOptional()
  @IsNumber()
  serviceCharge: number;
}

export class PayinMerchantOrderResDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  systemOrderId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsNotEmpty()
  @IsEnum(ChannelName)
  channel: ChannelName;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsEnum(CallBackStatus)
  callbackStatus: CallBackStatus;

  @IsString()
  user: string;

  @IsString()
  merchant: string;

  @IsEnum(PaymentMadeOn)
  payinMadeOn: PaymentMadeOn;
  member: string;

  @IsEnum(GatewayName)
  gatewayName: GatewayName | null;
}
