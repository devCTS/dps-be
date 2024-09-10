import { Module } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { MerchantController } from './merchant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from './entities/merchant.entity';
import { PayinMode } from './entities/payinMode.entity';
import { ProportionalPayinMode } from './entities/proportionalPayinMode.entity';
import { AmountRangePayinMode } from './entities/amountRangePayinMode.entity';
import { JwtModule } from 'src/services/jwt/jwt.module';
import { IdentityModule } from 'src/identity/identity.module';
import { ChannelModule } from 'src/channel/channel.module';
import { IP } from 'src/identity/entities/ip.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Merchant,
      PayinMode,
      ProportionalPayinMode,
      AmountRangePayinMode,
      IP,
    ]),
    JwtModule,
    IdentityModule,
    ChannelModule,
  ],
  controllers: [MerchantController],
  providers: [MerchantService],
})
export class MerchantModule {}
