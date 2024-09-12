import { PartialType } from '@nestjs/mapped-types';
import { CreateSubMerchantDto } from './create-sub-merchant.dto';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateSubMerchantDto extends PartialType(CreateSubMerchantDto) {
  @IsBoolean()
  @IsNotEmpty()
  updateLoginCredentials: boolean;
}
