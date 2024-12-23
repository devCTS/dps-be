import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateCommissionRatesDto {
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
