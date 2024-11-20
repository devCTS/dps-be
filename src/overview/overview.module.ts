import { Module } from '@nestjs/common';
import { OverviewAdminService } from './overview-admin.service';
import { OverviewController } from './overview-user.controller';
import { OverviewUserService } from './overview-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from 'src/agent/entities/agent.entity';
import { Member } from 'src/member/entities/member.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { FundRecord } from 'src/fund-record/entities/fund-record.entity';
import { Withdrawal } from 'src/withdrawal/entities/withdrawal.entity';
import { Payin } from 'src/payin/entities/payin.entity';
import { Payout } from 'src/payout/entities/payout.entity';
import { Topup } from 'src/topup/entities/topup.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Agent,
      Member,
      Admin,
      Merchant,
      TransactionUpdate,
      FundRecord,
      Withdrawal,
      Payin,
      Payout,
      Topup,
    ]),
  ],
  controllers: [OverviewController],
  providers: [OverviewAdminService, OverviewUserService],
})
export class OverviewModule {}
