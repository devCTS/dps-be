import {
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
