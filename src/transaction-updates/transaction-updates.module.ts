import { Module } from '@nestjs/common';
import { TransactionUpdatesService } from './transaction-updates.service';
import { TransactionUpdatesController } from './transaction-updates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionUpdate } from './entities/transaction-update.entity';
import { AgentReferralModule } from 'src/agent-referral/agent-referral.module';
import { IdentityModule } from 'src/identity/identity.module';
import { Identity } from 'src/identity/entities/identity.entity';
import { MemberReferralModule } from 'src/member-referral/member-referral.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionUpdate, Identity]),
    AgentReferralModule,
    MemberReferralModule,
    IdentityModule,
  ],
  controllers: [TransactionUpdatesController],
  providers: [TransactionUpdatesService],
  exports: [TransactionUpdatesService],
})
export class TransactionUpdatesModule {}
