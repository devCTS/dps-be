import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from './entities/agent.entity';
import { IdentityModule } from '../identity/identity.module';
import { IntegrationsModule } from 'src/integrations/integrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agent]),
    IdentityModule,
    IntegrationsModule,
  ],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AgentModule {}
