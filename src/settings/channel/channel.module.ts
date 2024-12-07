import { Module } from '@nestjs/common';
import { ChannelSettingsService } from './channel.service';
import { ChannelSettingsController } from './channel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelSettings } from './entities/channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelSettings])],
  controllers: [ChannelSettingsController],
  providers: [ChannelSettingsService],
})
export class ChannelModule {}
