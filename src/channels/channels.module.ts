import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channels } from './channels.entity';
import { ChannelsRepository } from './channels.repository';
import { ChannelsController } from './channels.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Channels]), ChannelsRepository],
  providers: [ChannelsService, ChannelsRepository],
  controllers: [ChannelsController],
})
export class ChannelsModule {}
