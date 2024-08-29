import { Injectable } from '@nestjs/common';
import { ChannelDetailsDto } from './dto/channel.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channels } from './channels.entity';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channels)
    private channelsRepository: Repository<Channels>,
  ) {}

  async addChannel(channelDetails: ChannelDetailsDto) {
    return await this.channelsRepository.save(channelDetails);
  }
}
