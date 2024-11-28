import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { GatewayName, PaymentMadeOn } from 'src/utils/enum/enum';

export class AssignPayoutOrderDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum(PaymentMadeOn)
  paymentMode: PaymentMadeOn;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  memberId?: string;

  @IsNumber()
  @IsNotEmpty()
  gatewayServiceRate: number;

  @IsEnum(GatewayName)
  @IsNotEmpty()
  gatewayName: GatewayName;
}
