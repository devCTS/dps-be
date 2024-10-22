import { Module } from '@nestjs/common';
import { PaymentSystemService } from './payment-system.service';
import { PaymentSystemController } from './payment-system.controller';
import { PhonePeModule } from './phonepe/phonepe.module';
import { RazorpayModule } from './razorpay/razorpay.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { HttpModule } from '@nestjs/axios';
import { PayinService } from 'src/payin/payin.service';
import { Payin } from 'src/payin/entities/payin.entity';
import { PayinModule } from 'src/payin/payin.module';
import { Config } from 'src/channel/entity/config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Merchant, Payin, Config]),
    PhonePeModule,
    RazorpayModule,
    HttpModule,
    PayinModule,
  ],
  controllers: [PaymentSystemController],
  providers: [PaymentSystemService],
})
export class PaymentSystemModule {}
