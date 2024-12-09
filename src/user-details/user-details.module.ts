import { Module } from '@nestjs/common';
import { UserDetailsController } from './user-details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from 'src/member/entities/member.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Agent } from 'src/agent/entities/agent.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { UserDetailsAdminService } from './user-details-admin.service';
import { UserDetailsAgentService } from './user-details-agent.service';
import { UserDetailsMemberService } from './user-details-member.service';
import { UserDetailsMerchantService } from './user-details-merchant.service';
import { Payin } from 'src/payin/entities/payin.entity';
import { Payout } from 'src/payout/entities/payout.entity';
import { Withdrawal } from 'src/withdrawal/entities/withdrawal.entity';
import { Topup } from 'src/topup/entities/topup.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { FundRecord } from 'src/fund-record/entities/fund-record.entity';
import { SystemConfigModule } from 'src/system-config/system-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      Member,
      Merchant,
      Agent,
      Payin,
      Payout,
      Withdrawal,
      Topup,
      TransactionUpdate,
      FundRecord,
    ]),
    SystemConfigModule,
  ],
  controllers: [UserDetailsController],
  providers: [
    UserDetailsAdminService,
    UserDetailsAgentService,
    UserDetailsMemberService,
    UserDetailsMerchantService,
  ],
})
export class UserDetailsModule {}
