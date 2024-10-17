import { Module } from '@nestjs/common';
import { LoadService } from './load.service';
import { LoadController } from './load.controller';
import { AdminModule } from 'src/admin/admin.module';
import { GatewayModule } from 'src/gateway/gateway.module';
import { ChannelModule } from 'src/channel/channel.module';
import { SystemConfigModule } from 'src/system-config/system-config.module';

@Module({
  imports: [AdminModule, GatewayModule, ChannelModule, SystemConfigModule],
  controllers: [LoadController],
  providers: [LoadService],
})
export class LoadModule {}
