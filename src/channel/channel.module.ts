import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelDetails } from './entities/channelDetails.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Channel, ChannelDetails])],
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelModule {}
