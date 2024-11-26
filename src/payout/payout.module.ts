import { forwardRef, Module } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { PayoutController } from './payout.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { PayoutAdminService } from './payout-admin.service';
import { PayoutMemberService } from './payout-member.service';
import { PayoutMerchantService } from './payout-merchant.service';
import { TransactionUpdatesModule } from 'src/transaction-updates/transaction-updates.module';
import { EndUserModule } from 'src/end-user/end-user.module';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Member } from 'src/member/entities/member.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { MerchantModule } from 'src/merchant/merchant.module';
import { MemberModule } from 'src/member/member.module';
import { SystemConfigModule } from 'src/system-config/system-config.module';
import { AgentModule } from 'src/agent/agent.module';
import { PaymentSystemModule } from 'src/payment-system/payment-system.module';
import { FundRecordModule } from 'src/fund-record/fund-record.module';
import { NotificationModule } from 'src/notification/notification.module';
import { AlertModule } from 'src/alert/alert.module';
import { Submerchant } from 'src/sub-merchant/entities/sub-merchant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payout,
      EndUser,
      Merchant,
      Member,
      TransactionUpdate,
      Submerchant,
    ]),
    TransactionUpdatesModule,
    EndUserModule,
    MerchantModule,
    MemberModule,
    AgentModule,
    SystemConfigModule,
    PaymentSystemModule,
    FundRecordModule,
    NotificationModule,
    forwardRef(() => AlertModule),
  ],
  controllers: [PayoutController],
  providers: [
    PayoutService,
    PayoutAdminService,
    PayoutMemberService,
    PayoutMerchantService,
  ],
  exports: [
    PayoutService,
    PayoutAdminService,
    PayoutMemberService,
    PayoutMerchantService,
  ],
})
export class PayoutModule {}
