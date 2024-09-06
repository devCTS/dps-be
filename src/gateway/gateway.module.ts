import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gateway } from './entities/gateway.entity';
import { ProdMerchantKey } from './entities/prodMerchantKey.entity';
import { UatMerchantKey } from './entities/uatMerchantKey.entity';
import { GatewayToChannel } from './entities/gatewayToChannel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Gateway,
      ProdMerchantKey,
      UatMerchantKey,
      GatewayToChannel,
    ]),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
