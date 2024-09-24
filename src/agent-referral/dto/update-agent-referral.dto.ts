import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAgentReferralDto {
  @IsOptional()
  @IsNumber()
  payinCommission?: number;

  @IsOptional()
  @IsNumber()
  payoutCommission?: number;

  @IsOptional()
  @IsNumber()
  merchantPayinServiceRate?: number;

  @IsOptional()
  @IsNumber()
  merchantPayoutServiceRate?: number;

  @IsString()
  status: string;
}
