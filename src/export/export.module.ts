import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { AdminModule } from 'src/admin/admin.module';
import { MemberModule } from 'src/member/member.module';
import { MerchantModule } from 'src/merchant/merchant.module';
import { SubMerchantModule } from 'src/sub-merchant/sub-merchant.module';
import { AgentModule } from 'src/agent/agent.module';

@Module({
  imports: [
    AdminModule,
    MemberModule,
    MerchantModule,
    SubMerchantModule,
    AgentModule,
  ],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
