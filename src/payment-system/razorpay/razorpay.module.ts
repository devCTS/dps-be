import { Module } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [RazorpayService],
  exports: [RazorpayService],
})
export class RazorpayModule {}
