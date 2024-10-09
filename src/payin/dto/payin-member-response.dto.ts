import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ChannelName, OrderStatus } from 'src/utils/enum/enum';

export class PayinMemberResponseDto {
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
  commission: number;

  @IsOptional()
  @IsNumber()
  quotaDebit: number;
}
