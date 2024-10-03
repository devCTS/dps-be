import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { Identity } from 'src/identity/entities/identity.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelSettings } from './entities/channel-settings.entity';
import { Phonepe } from './entities/phonepe.entity';
import { Razorpay } from './entities/razorpay.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelSettings, Phonepe, Razorpay]),
    Identity,
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
