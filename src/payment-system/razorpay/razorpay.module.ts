import { Module } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { HttpModule } from '@nestjs/axios';
import { EndUserModule } from 'src/end-user/end-user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { PayinMode } from 'src/merchant/entities/payinMode.entity';
import { PayinModule } from 'src/payin/payin.module';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([EndUser])],
  providers: [RazorpayService],
  exports: [RazorpayService],
})
export class RazorpayModule {}
