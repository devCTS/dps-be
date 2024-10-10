import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { IdentityModule } from 'src/identity/identity.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from './entities/agent.entity';
import { JwtModule } from 'src/services/jwt/jwt.module';
import { AgentReferralModule } from 'src/agent-referral/agent-referral.module';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { TransactionUpdatesModule } from 'src/transaction-updates/transaction-updates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agent, TransactionUpdate]),
    IdentityModule,
    JwtModule,
    AgentReferralModule,
    TransactionUpdatesModule,
  ],
  providers: [AgentService],
  controllers: [AgentController],
  exports: [AgentService],
})
export class AgentModule {}
