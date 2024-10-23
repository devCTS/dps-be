import { Module } from '@nestjs/common';
import { PaymentSystemService } from './payment-system.service';
import { PaymentSystemController } from './payment-system.controller';
import { PhonePeModule } from './phonepe/phonepe.module';
import { RazorpayModule } from './razorpay/razorpay.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { HttpModule } from '@nestjs/axios';
import { Payin } from 'src/payin/entities/payin.entity';
import { PayinModule } from 'src/payin/payin.module';
import { Config } from 'src/channel/entity/config.entity';
import { PaymentSystemUtilService } from './payment-system.util.service';
import { Member } from 'src/member/entities/member.entity';
import { SystemConfigModule } from 'src/system-config/system-config.module';
import { Razorpay } from 'src/gateway/entities/razorpay.entity';
import { Phonepe } from 'src/gateway/entities/phonepe.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Merchant,
      Payin,
      Config,
      Member,
      Razorpay,
      Phonepe,
    ]),
    PhonePeModule,
    RazorpayModule,
    HttpModule,
    PayinModule,
    SystemConfigModule,
  ],
  controllers: [PaymentSystemController],
  providers: [PaymentSystemService, PaymentSystemUtilService],
})
export class PaymentSystemModule {}
