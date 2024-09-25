import { IsNumber, IsString } from 'class-validator';

export class CreateMemberReferralDto {
  @IsString()
  referralCode: string;

  @IsNumber()
  memberId: number;

  @IsNumber()
  payinCommission: number;

  @IsNumber()
  payoutCommission: number;

  @IsNumber()
  topupCommission: number;

  @IsNumber()
  referredMemberPayinCommission: number;

  @IsNumber()
  referredMemberPayoutCommission: number;

  @IsNumber()
  referredMemberTopupCommission: number;
}
