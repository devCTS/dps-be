import { Module } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { MerchantController } from './merchant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from './entities/merchant.entity';
import { PayinMode } from './entities/payinMode.entity';
import { ProportionalPayinMode } from './entities/proportionalPayinMode.entity';
import { AmountRangePayinMode } from './entities/amountRangePayinMode.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Merchant,
      PayinMode,
      ProportionalPayinMode,
      AmountRangePayinMode,
    ]),
  ],
  controllers: [MerchantController],
  providers: [MerchantService],
})
export class MerchantModule {}
