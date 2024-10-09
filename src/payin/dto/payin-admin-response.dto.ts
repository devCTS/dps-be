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

export class PayinAdminResponseDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  systemOrderId: string;

  @IsNotEmpty()
  @IsString()
  merchantOrderId: string;

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
  @IsEnum(CallBackStatus)
  callbackStatus: CallBackStatus;

  @IsNotEmpty()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsString()
  merchant: string;

  @IsNotEmpty()
  @IsEnum(PaymentMadeOn)
  payinMadeOn: PaymentMadeOn;

  @IsOptional()
  @IsString()
  member: string | null;

  @IsOptional()
  @IsEnum(GatewayName)
  gatewayName: GatewayName | null;

  @IsNotEmpty()
  @IsNumber()
  merchantFee: number;

  @IsNotEmpty()
  @IsNumber()
  merchantCharge: number;

  @IsNotEmpty()
  @IsNumber()
  systemProfit: number;
}

export class PayinDetailsAdminResDto {
  @IsNumber()
  id: number;

  @IsString()
  systemOrderId: string;

  @IsString()
  merchantOrderId: string;

  @IsNumber()
  amount: number;

  @IsEnum(OrderStatus)
  status: OrderStatus;

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
