import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gateway } from './entities/gateway.entity';
import { GatewayToChannel } from './entities/gatewayToChannel.entity';
import { MerchantKey } from './entities/MerchantKey.entity';
import { Channel } from 'src/channel/entities/channel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Gateway, GatewayToChannel, MerchantKey, Channel]),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
