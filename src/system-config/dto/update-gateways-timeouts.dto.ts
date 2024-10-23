import { IsEnum, IsNumber } from 'class-validator';
import { GatewayName } from 'src/utils/enum/enum';

export class UpdateGatewaysTimeoutsDto {
  @IsEnum(GatewayName)
  defaultPayinGateway: GatewayName;

  @IsEnum(GatewayName)
  defaultPayoutGateway: GatewayName;

  @IsEnum(GatewayName)
  defaultWithdrawalGateway: GatewayName;

  @IsNumber()
  payinTimeout: number;

  @IsNumber()
  payoutTimeout: number;
}
