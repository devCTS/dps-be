import {
  IsDate,
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

export class PayinDetailsMemberResDto {
  @IsNumber()
  id: number;

  @IsString()
  systemOrderId: string;

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

  @IsString()
  user: string;
}
