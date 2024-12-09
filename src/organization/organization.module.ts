import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from 'src/agent/entities/agent.entity';
import { Organization } from './entities/organization';

@Module({
  imports: [TypeOrmModule.forFeature([Agent, Organization])],
  providers: [OrganizationService],
})
export class OrganizationModule {}
