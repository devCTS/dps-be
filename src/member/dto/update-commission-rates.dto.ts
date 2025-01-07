import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateCommissionRatesDto {
  @IsNumber()
  @IsNotEmpty()
  agentPayinCommissionRate: number;

  @IsNumber()
  @IsNotEmpty()
  agentPayoutCommissionRate: number;

  @IsNumber()
  @IsNotEmpty()
  agentTopupCommissionRate: number;

  @IsNumber()
  @IsNotEmpty()
  memberId: number;

  @IsString()
  @IsNotEmpty()
  teamId: string;
}
