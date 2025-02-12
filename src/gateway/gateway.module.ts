import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { Identity } from 'src/identity/entities/identity.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelSettings } from './entities/channel-settings.entity';
import { Phonepe } from './entities/phonepe.entity';
import { Razorpay } from './entities/razorpay.entity';
import { JwtModule } from 'src/services/jwt/jwt.module';
import { Uniqpay } from './entities/uniqpay.entity';
import { Payu } from './entities/payu.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChannelSettings,
      Phonepe,
      Razorpay,
      Uniqpay,
      Payu,
    ]),
    Identity,
    JwtModule,
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
