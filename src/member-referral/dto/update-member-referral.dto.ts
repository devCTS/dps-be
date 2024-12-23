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

  @IsString()
  status: string;
}
