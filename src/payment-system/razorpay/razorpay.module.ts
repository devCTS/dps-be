import { Module } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { HttpModule } from '@nestjs/axios';
import { EndUserModule } from 'src/end-user/end-user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { PayinMode } from 'src/merchant/entities/payinMode.entity';
import { PayinModule } from 'src/payin/payin.module';
import { Razorpay } from 'src/gateway/entities/razorpay.entity';
import { JwtModule } from 'src/services/jwt/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EndUser, Razorpay]),
    HttpModule,
    JwtModule,
  ],
  providers: [RazorpayService],
  exports: [RazorpayService],
})
export class RazorpayModule {}
