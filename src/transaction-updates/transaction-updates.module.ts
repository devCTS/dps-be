import { Module } from '@nestjs/common';
import { TransactionUpdatesPayinService } from './transaction-updates-payin.service';
import { TransactionUpdatesController } from './transaction-updates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionUpdate } from './entities/transaction-update.entity';
import { AgentReferralModule } from 'src/agent-referral/agent-referral.module';
import { IdentityModule } from 'src/identity/identity.module';
import { Identity } from 'src/identity/entities/identity.entity';
import { MemberReferralModule } from 'src/member-referral/member-referral.module';
import { SystemConfigModule } from 'src/system-config/system-config.module';
import { TransactionUpdatesPayoutService } from './transaction-updates-payout.service';
import { TransactionUpdatesWithdrawalService } from './transaction-updates-withdrawal.service';
import { TransactionUpdatesService } from './transaction-updates.service';
import { TransactionUpdatesTopupService } from './transaction-updates-topup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionUpdate, Identity]),
    AgentReferralModule,
    MemberReferralModule,
    IdentityModule,
    SystemConfigModule,
  ],
  controllers: [TransactionUpdatesController],
  providers: [
    TransactionUpdatesPayinService,
    TransactionUpdatesPayoutService,
    TransactionUpdatesWithdrawalService,
    TransactionUpdatesService,
    TransactionUpdatesTopupService,
  ],
  exports: [
    TransactionUpdatesPayinService,
    TransactionUpdatesPayoutService,
    TransactionUpdatesWithdrawalService,
    TransactionUpdatesTopupService,
  ],
})
export class TransactionUpdatesModule {}
