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
import { ChannelSettings } from 'src/gateway/entities/channel-settings.entity';
import { AmountRangePayinMode } from 'src/merchant/entities/amountRangePayinMode.entity';
import { ProportionalPayinMode } from 'src/merchant/entities/proportionalPayinMode.entity';
import { RazorpayService } from './razorpay/razorpay.service';
import { PhonepeService } from 'src/upstream-gateway/phonepe/phonepe.service';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { EndUserModule } from 'src/end-user/end-user.module';
import { SocketModule } from 'src/socket/socket.module';
import { UniqpayModule } from './uniqpay/uniqpay.module';
import { UniqpayService } from './uniqpay/uniqpay.service';
import { MemberChannelModule } from './member/member-channel.module';
import { MemberChannelService } from './member/member-channel.service';
import { JwtModule } from 'src/services/jwt/jwt.module';
import { PayinSandbox } from 'src/payin/entities/payin-sandbox.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Merchant,
      Payin,
      PayinSandbox,
      Config,
      Member,
      Razorpay,
      Phonepe,
      ChannelSettings,
      AmountRangePayinMode,
      ProportionalPayinMode,
      EndUser,
    ]),
    PhonePeModule,
    RazorpayModule,
    UniqpayModule,
    HttpModule,
    PayinModule,
    SystemConfigModule,
    EndUserModule,
    SocketModule,
    MemberChannelModule,
    JwtModule,
  ],
  controllers: [PaymentSystemController],
  providers: [
    PaymentSystemService,
    PaymentSystemUtilService,
    RazorpayService,
    PhonepeService,
    UniqpayService,
    MemberChannelService,
  ],
  exports: [PaymentSystemService],
})
export class PaymentSystemModule {}
