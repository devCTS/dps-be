import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { GatewayName } from 'src/utils/enum/enum';

export class GetPayPageDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  amount: string;

  @IsNotEmpty()
  @IsEnum(GatewayName)
  gateway: GatewayName;

  @IsNotEmpty()
  @IsString()
  orderId: string;
}
