import { forwardRef, Module } from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { WithdrawalController } from './withdrawal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { Member } from 'src/member/entities/member.entity';
import { WithdrawalMemberService } from './withdrawal-member.service';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { WithdrawalAgentService } from './withdrawal-agent.service';
import { WithdrawalAdminService } from './withdrawal-admin.service';
import { WithdrawalMerchantService } from './withdrawal-merchant.service';
import { Identity } from 'src/identity/entities/identity.entity';
import { IdentityModule } from 'src/identity/identity.module';
import { TransactionUpdatesModule } from 'src/transaction-updates/transaction-updates.module';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { Agent } from 'src/agent/entities/agent.entity';
import { MemberModule } from 'src/member/member.module';
import { AgentModule } from 'src/agent/agent.module';
import { MerchantModule } from 'src/merchant/merchant.module';
import { SystemConfigModule } from 'src/system-config/system-config.module';
import { PaymentSystemModule } from 'src/payment-system/payment-system.module';
import { ChannelSettings } from 'src/gateway/entities/channel-settings.entity';
import { FundRecordModule } from 'src/fund-record/fund-record.module';
import { AlertModule } from 'src/alert/alert.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Withdrawal,
      Member,
      Agent,
      Merchant,
      Identity,
      TransactionUpdate,
      ChannelSettings,
    ]),
    IdentityModule,
    TransactionUpdatesModule,
    MemberModule,
    AgentModule,
    MerchantModule,
    SystemConfigModule,
    PaymentSystemModule,
    FundRecordModule,
    forwardRef(() => AlertModule),
  ],
  controllers: [WithdrawalController],
  providers: [
    WithdrawalService,
    WithdrawalMemberService,
    WithdrawalAgentService,
    WithdrawalAdminService,
    WithdrawalMerchantService,
  ],
  exports: [WithdrawalService, WithdrawalAdminService],
})
export class WithdrawalModule {}
