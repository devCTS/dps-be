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
import { Payout } from 'src/payout/entities/payout.entity';
import { Withdrawal } from 'src/withdrawal/entities/withdrawal.entity';
import { SystemConfigModule } from 'src/system-config/system-config.module';
import { AgentReferral } from 'src/agent-referral/entities/agent-referral.entity';
import { Organization } from 'src/organization/entities/organization';
import { OrganizationModule } from 'src/organization/organization.module';
import { Agent } from 'src/agent/entities/agent.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Merchant,
      PayinMode,
      ProportionalPayinMode,
      AmountRangePayinMode,
      IP,
      TransactionUpdate,
      Payout,
      Withdrawal,
      AgentReferral,
      Organization,
      Agent,
    ]),
    JwtModule,
    IdentityModule,
    AgentReferralModule,
    forwardRef(() => PayoutModule),
    TransactionUpdatesModule,
    ChannelModule,
    SystemConfigModule,
    OrganizationModule,
  ],
  controllers: [MerchantController],
  providers: [MerchantService],
  exports: [MerchantService],
})
export class MerchantModule {}
