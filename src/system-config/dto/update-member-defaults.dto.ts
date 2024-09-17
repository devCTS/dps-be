import { IsNumber } from 'class-validator';

export class UpdateMemberDefaultsDto {
  @IsNumber()
  payinCommissionRateForMember: number;

  @IsNumber()
  payoutCommissionRateForMember: number;

  @IsNumber()
  topupCommissionRateForMember: number;

  @IsNumber()
  minimumPayoutAmountForMember: number;

  @IsNumber()
  maximumPayoutAmountForMember: number;

  @IsNumber()
  maximumDailyPayoutAmountForMember: number;
}
