import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAgentReferralDto {
  @IsNumber()
  agentId: number;

  @IsString()
  agentType: 'agent' | 'merchant';

  @IsString()
  referralCode: string;

  @IsNumber()
  payinCommission: number;

  @IsNumber()
  payoutCommission: number;

  @IsOptional()
  @IsNumber()
  merchantPayinServiceRate?: number;

  @IsOptional()
  @IsNumber()
  merchantPayoutServiceRate?: number;
}
