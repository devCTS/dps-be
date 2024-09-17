import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { IdentityModule } from 'src/identity/identity.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from './entities/agent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agent]), IdentityModule],
  providers: [AgentService],
  controllers: [AgentController],
})
export class AgentModule {}
