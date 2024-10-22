import { Module } from '@nestjs/common';
import { AgentReferralService } from './agent-referral.service';
import { AgentReferralController } from './agent-referral.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentReferral } from './entities/agent-referral.entity';
import { Agent } from 'src/agent/entities/agent.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AgentReferral, Agent, Merchant])],
  controllers: [AgentReferralController],
  providers: [AgentReferralService],
  exports: [AgentReferralService],
})
export class AgentReferralModule {}
