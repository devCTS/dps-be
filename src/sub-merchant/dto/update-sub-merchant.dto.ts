import { PartialType } from '@nestjs/mapped-types';
import { CreateSubMerchantDto } from './create-sub-merchant.dto';

export class UpdateSubMerchantDto extends PartialType(CreateSubMerchantDto) {}
