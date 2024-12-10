import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ServiceRateType } from 'src/utils/enum/enum';

export class UpdateAgentReferralDto {
  @IsOptional()
  @IsNumber()
  payinCommission?: number;

  @IsOptional()
  @IsNumber()
  payoutCommission?: number;

  @IsOptional()
  merchantPayinServiceRate?: ServiceRateType;

  @IsOptional()
  merchantPayoutServiceRate?: ServiceRateType;

  @IsString()
  status: string;
}
