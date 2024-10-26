import { forwardRef, Module } from '@nestjs/common';
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
import { PayoutModule } from 'src/payout/payout.module';
import { TransactionUpdatesModule } from 'src/transaction-updates/transaction-updates.module';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { ChannelModule } from 'src/channel/channel.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Merchant,
      PayinMode,
      ProportionalPayinMode,
      AmountRangePayinMode,
      IP,
      TransactionUpdate,
    ]),
    JwtModule,
    IdentityModule,
    AgentReferralModule,
    forwardRef(() => PayoutModule),
    TransactionUpdatesModule,
    ChannelModule,
  ],
  controllers: [MerchantController],
  providers: [MerchantService],
  exports: [MerchantService],
})
export class MerchantModule {}
