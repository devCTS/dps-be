import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ServiceRateType } from 'src/utils/enum/enum';

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
  merchantPayinServiceRate?: ServiceRateType;

  @IsOptional()
  merchantPayoutServiceRate?: ServiceRateType;
}
