import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateMemberReferralDto {
  @IsOptional()
  @IsNumber()
  payinCommission?: number;

  @IsOptional()
  @IsNumber()
  payoutCommission?: number;

  @IsOptional()
  @IsNumber()
  topupCommission?: number;

  @IsOptional()
  @IsNumber()
  referredMemberPayinCommission?: number;

  @IsOptional()
  @IsNumber()
  referredMemberPayoutCommission?: number;

  @IsOptional()
  @IsNumber()
  referredMemberTopupCommission?: number;

  @IsString()
  status: string;
}
