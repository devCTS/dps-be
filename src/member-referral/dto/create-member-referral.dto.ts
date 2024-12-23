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
}
