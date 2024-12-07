import { Module } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from './entities/identity.entity';
import { IdentityRepository } from './identity.repository';
import { IntegrationsModule } from 'src/integrations/integrations.module';
import { Merchant } from '../merchant/entities/merchant.entity';
import { SubMerchant } from '../sub-merchant/entities/sub-merchant.entity';
import { Agent } from '../agent/entities/agent.entity';
import { Member } from '../member/entities/member.entity';
import { Admin } from '../admin/entities/admin.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Identity,
      Merchant,
      SubMerchant,
      Agent,
      Member,
      Admin,
    ]),
    IntegrationsModule,
  ],
  providers: [IdentityService, IdentityRepository],
  exports: [IdentityService],
})
export class IdentityModule {}
