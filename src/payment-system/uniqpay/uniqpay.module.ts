import { Module } from '@nestjs/common';
import { UniqpayService } from './uniqpay.service';

@Module({
  providers: [UniqpayService],
  exports: [UniqpayService],
})
export class UniqpayModule {}
