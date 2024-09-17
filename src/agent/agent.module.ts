import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { IdentityModule } from 'src/identity/identity.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from './entities/agent.entity';
import { JwtModule } from 'src/services/jwt/jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([Agent]), IdentityModule, JwtModule],
  providers: [AgentService],
  controllers: [AgentController],
  exports: [AgentService],
})
export class AgentModule {}
