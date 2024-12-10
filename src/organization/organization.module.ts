import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from 'src/agent/entities/agent.entity';
import { Organization } from './entities/organization';
import { OrganizationController } from './organization.controller';
import { Merchant } from 'src/merchant/entities/merchant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agent, Organization, Merchant])],
  providers: [OrganizationService],
  controllers: [OrganizationController],
  exports: [OrganizationService],
})
export class OrganizationModule {}
