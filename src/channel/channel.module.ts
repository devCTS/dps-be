import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelProfileField } from './entities/channelProfileField.entity';
import { ChannelProfileFilledField } from './entities/channelProfileFilledField.entity';
import { PayinPayoutChannel } from './entities/payinPayoutChannel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Channel,
      ChannelProfileField,
      ChannelProfileFilledField,
      PayinPayoutChannel,
    ]),
  ],
  controllers: [ChannelController],
  providers: [ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
