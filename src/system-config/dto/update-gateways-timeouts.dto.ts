import { IsNumber, IsObject } from 'class-validator';

export class UpdateGatewaysTimeoutsDto {
  @IsObject()
  defaultPayinGateway: object;

  @IsObject()
  defaultPayoutGateway: object;

  @IsObject()
  defaultWithdrawalGateway: object;

  @IsNumber()
  payinTimeout: number;

  @IsNumber()
  payoutTimeout: number;
}
