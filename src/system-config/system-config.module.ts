import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SystemConfigService } from './system-config.service';
import { SystemConfigController } from './system-config.controller';

import { ChannelModule } from 'src/channel/channel.module';
import { SystemConfig } from './entities/system-config.entity';
import { ChannelProfileFilledField } from 'src/channel/entities/channelProfileFilledField.entity';
import { Identity } from 'src/identity/entities/identity.entity';
import { Gateway } from 'src/gateway/entities/gateway.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemConfig,
      ChannelProfileFilledField,
      Identity,
      Gateway,
    ]),
    ChannelModule,
  ],
  controllers: [SystemConfigController],
  providers: [SystemConfigService],
})
export class SystemConfigModule {}
