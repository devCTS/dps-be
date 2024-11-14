import { Module } from '@nestjs/common';
import { ManualSettlementService } from './manual-settlement.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { Identity } from 'src/identity/entities/identity.entity';
import { MemberModule } from 'src/member/member.module';
import { AgentModule } from 'src/agent/agent.module';
import { MerchantModule } from 'src/merchant/merchant.module';
import { Member } from 'src/member/entities/member.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Agent } from 'src/agent/entities/agent.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransactionUpdate,
      Identity,
      Member,
      Merchant,
      Agent,
    ]),
    MemberModule,
    AgentModule,
    MerchantModule,
  ],
  controllers: [],
  providers: [ManualSettlementService],
})
export class ManualSettlementModule {}
