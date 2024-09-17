import { IsNumber } from 'class-validator';

export class UpdateGatewaysTimeoutsDto {
  @IsNumber()
  defaultPayinGateway: number;

  @IsNumber()
  defaultPayoutGateway: number;

  @IsNumber()
  defaultWithdrawalGateway: number;

  @IsNumber()
  payinTimeout: number;

  @IsNumber()
  payoutTimeout: number;
}
