import { IsNumber, IsObject } from 'class-validator';
import { ServiceRateType } from 'src/utils/enum/enum';

export class UpdateMerchantDefaultsDto {
  @IsObject()
  payinServiceRateForMerchant: ServiceRateType;

  @IsObject()
  payoutServiceRateForMerchant: ServiceRateType;

  @IsNumber()
  minimumPayoutAmountForMerchant: number;

  @IsNumber()
  maximumPayoutAmountForMerchant: number;

  @IsNumber()
  endUserPayinLimit: number;
}
