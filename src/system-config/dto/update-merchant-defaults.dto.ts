import { IsNumber } from 'class-validator';

export class UpdateMerchantDefaultsDto {
  @IsNumber()
  payinServiceRateForMerchant: number;

  @IsNumber()
  payoutServiceRateForMerchant: number;

  @IsNumber()
  minimumPayoutAmountForMerchant: number;

  @IsNumber()
  maximumPayoutAmountForMerchant: number;

  @IsNumber()
  endUserPayinLimit: number;
}
