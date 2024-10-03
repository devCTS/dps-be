import { Module } from '@nestjs/common';
import { PaymentSystemService } from './payment-system.service';
import { PaymentSystemController } from './payment-system.controller';
import { HttpModule } from '@nestjs/axios';
import { PhonepeService } from './phonepe/phonepe.service';
import { PhonePeModule } from './phonepe/phonepe.module';
import { RazorpayModule } from './razorpay/razorpay.module';

@Module({
  imports: [PhonePeModule, RazorpayModule],
  controllers: [PaymentSystemController],
  providers: [PaymentSystemService],
})
export class PaymentSystemModule {}
