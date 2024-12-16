import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { OrderType } from 'src/utils/enum/enum';

export class ChannelListDto {
  @IsNotEmpty()
  @IsEnum(OrderType)
  orderType: OrderType;

  @IsOptional()
  @IsNumber()
  merchantId: number;
}
