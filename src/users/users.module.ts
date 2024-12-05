import { Module } from '@nestjs/common';
import { IdentityModule } from './identity/identity.module';
import { MerchantModule } from './merchant/merchant.module';
import { AdminModule } from './admin/admin.module';
import { MemberModule } from './member/member.module';
import { AgentModule } from './agent/agent.module';
import { SubMerchantModule } from './sub-merchant/sub-merchant.module';

@Module({
  imports: [IdentityModule, MerchantModule, AdminModule, MemberModule, AgentModule, SubMerchantModule]
})
export class UsersModule {}
