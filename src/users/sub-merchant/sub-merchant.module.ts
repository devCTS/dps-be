import { Module } from '@nestjs/common';
import { SubMerchantService } from './sub-merchant.service';
import { SubMerchantController } from './sub-merchant.controller';

@Module({
  controllers: [SubMerchantController],
  providers: [SubMerchantService],
})
export class SubMerchantModule {}
