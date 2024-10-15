import { Module } from '@nestjs/common';
import { TransactionUpdatesService } from './transaction-updates.service';
import { TransactionUpdatesController } from './transaction-updates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionUpdate } from './entities/transaction-update.entity';
import { AgentReferralModule } from 'src/agent-referral/agent-referral.module';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionUpdate]), AgentReferralModule],
  controllers: [TransactionUpdatesController],
  providers: [TransactionUpdatesService],
  exports: [TransactionUpdatesService],
})
export class TransactionUpdatesModule {}
