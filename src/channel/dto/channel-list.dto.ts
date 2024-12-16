import { IsNotEmpty, IsOptional } from 'class-validator';
import { OrderType } from 'src/utils/enum/enum';

export class ChannelListDto {
  @IsNotEmpty()
  orderType: OrderType;

  @IsOptional()
  merchantId: number;
}
