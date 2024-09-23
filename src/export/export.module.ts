import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { ChannelModule } from 'src/channel/channel.module';
import { AdminModule } from 'src/admin/admin.module';
import { MemberModule } from 'src/member/member.module';
import { MerchantModule } from 'src/merchant/merchant.module';
import { SubMerchantModule } from 'src/sub-merchant/sub-merchant.module';
import { GatewayModule } from 'src/gateway/gateway.module';
import { AgentModule } from 'src/agent/agent.module';

@Module({
  imports: [
    ChannelModule,
    AdminModule,
    MemberModule,
    MerchantModule,
    SubMerchantModule,
    GatewayModule,
    AgentModule,
  ],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
