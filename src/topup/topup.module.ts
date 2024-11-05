import { Module } from '@nestjs/common';
import { TopupService } from './topup.service';
import { TopupController } from './topup.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topup } from './entities/topup.entity';
import { TopupAdminService } from './topup-admin.service';
import { TopupMemberService } from './topup-member.service';
import { TransactionUpdatesModule } from 'src/transaction-updates/transaction-updates.module';
import { EndUserModule } from 'src/end-user/end-user.module';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { Member } from 'src/member/entities/member.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { MemberModule } from 'src/member/member.module';
import { SystemConfigModule } from 'src/system-config/system-config.module';
import { AgentModule } from 'src/agent/agent.module';
import { PaymentSystemModule } from 'src/payment-system/payment-system.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Topup, EndUser, Member, TransactionUpdate]),
    TransactionUpdatesModule,
    EndUserModule,
    MemberModule,
    AgentModule,
    SystemConfigModule,
    PaymentSystemModule,
    TransactionUpdatesModule,
  ],
  controllers: [TopupController],
  providers: [TopupService, TopupAdminService, TopupMemberService],
  exports: [TopupService, TopupAdminService, TopupMemberService],
})
export class TopupModule {}
