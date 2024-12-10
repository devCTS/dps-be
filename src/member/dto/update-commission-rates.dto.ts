import { IsNotEmpty, isNotEmpty, IsNumber } from 'class-validator';

export class UpdateCommissionRatesDto {
  @IsNumber()
  @IsNotEmpty()
  payinCommissionRate: number;

  @IsNumber()
  @IsNotEmpty()
  payoutCommissionRate: number;

  @IsNumber()
  @IsNotEmpty()
  agentPayinCommissionRate: number;

  @IsNumber()
  @IsNotEmpty()
  agentPayoutCommissionRate: number;

  @IsNumber()
  @IsNotEmpty()
  memberId: number;
}
