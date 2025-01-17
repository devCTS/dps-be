import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GatewayName } from 'src/utils/enum/enum';

export class GetPayPageDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  amount?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(GatewayName)
  gateway: GatewayName;

  @IsNotEmpty()
  @IsString()
  orderId: string;
}
