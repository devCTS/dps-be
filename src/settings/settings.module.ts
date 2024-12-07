import { Module } from '@nestjs/common';
import { GatewayModule } from './gateway/gateway.module';
import { ChannelModule } from './channel/channel.module';
import { SystemConfigModule } from './system-config/system-config.module';

@Module({
  imports: [GatewayModule, ChannelModule, SystemConfigModule]
})
export class SettingsModule {}
