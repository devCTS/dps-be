import { Module } from '@nestjs/common';
import { SubMerchantService } from './sub-merchant.service';
import { SubMerchantController } from './sub-merchant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submerchant } from './entities/sub-merchant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Submerchant])],
  controllers: [SubMerchantController],
  providers: [SubMerchantService],
})
export class SubMerchantModule {}
