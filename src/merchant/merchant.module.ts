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
import { IP } from 'src/identity/entities/ip.entity';
import { AgentReferralModule } from 'src/agent-referral/agent-referral.module';

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
    AgentReferralModule,
  ],
  controllers: [MerchantController],
  providers: [MerchantService],
  exports: [MerchantService],
})
export class MerchantModule {}
