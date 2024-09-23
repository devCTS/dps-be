import { Module } from '@nestjs/common';
import { AgentReferralService } from './agent-referral.service';
import { AgentReferralController } from './agent-referral.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentReferral } from './entities/agent-referral.entity';
import { Agent } from 'src/agent/entities/agent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AgentReferral, Agent])],
  controllers: [AgentReferralController],
  providers: [AgentReferralService],
})
export class AgentReferralModule {}
