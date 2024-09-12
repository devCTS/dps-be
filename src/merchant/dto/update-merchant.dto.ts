import { PartialType } from '@nestjs/mapped-types';
import { CreateMerchantDto } from './create-merchant.dto';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateMerchantDto extends PartialType(CreateMerchantDto) {
  @IsBoolean()
  @IsNotEmpty()
  updateLoginCredentials: boolean;

  @IsBoolean()
  @IsNotEmpty()
  updateWithdrawalCredentials: boolean;
}
