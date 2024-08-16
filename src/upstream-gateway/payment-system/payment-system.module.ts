import { Module } from '@nestjs/common';
import { PaymentSystemController } from './payment-system.controller';
import { PaymentSystemService } from './payment-system.service';
import { RazorpayService } from '../razorpay/razorpay.service';
import { PhonepeService } from '../phonepe/phonepe.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [PaymentSystemController],
  providers: [PaymentSystemService, RazorpayService, PhonepeService],
})
export class PaymentSystemModule {}
