import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { AdminModule } from 'src/admin/admin.module';
import { MemberModule } from 'src/member/member.module';
import { MerchantModule } from 'src/merchant/merchant.module';
import { SubMerchantModule } from 'src/sub-merchant/sub-merchant.module';
import { AgentModule } from 'src/agent/agent.module';
import { TopupModule } from 'src/topup/topup.module';
import { PayinModule } from 'src/payin/payin.module';
import { PayoutModule } from 'src/payout/payout.module';
import { WithdrawalModule } from 'src/withdrawal/withdrawal.module';
import { TransactionUpdatesModule } from 'src/transaction-updates/transaction-updates.module';
import { FundRecordModule } from 'src/fund-record/fund-record.module';

@Module({
  imports: [
    AdminModule,
    MemberModule,
    MerchantModule,
    SubMerchantModule,
    AgentModule,
    TopupModule,
    PayinModule,
    PayoutModule,
    WithdrawalModule,
    TransactionUpdatesModule,
    FundRecordModule,
  ],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
