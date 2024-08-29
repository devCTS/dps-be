import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChannelDetailsDto, UpdateChannelDto } from './dto/channel.dto';
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
    const isChannelsExists = await this.getChannelByTag(channelDetails.tag);

    if (isChannelsExists) {
      throw new HttpException('Channel already exists.', HttpStatus.CONFLICT);
    }

    return await this.channelsRepository.save(channelDetails);
  }

  async getChannelByTag(tag: string) {
    return await this.channelsRepository.findOneBy({ tag });
  }

  async getAllChannels() {
    return await this.channelsRepository.find();
  }

  async getChannelById(id: string) {
    return await this.channelsRepository.findOneBy({ id });
  }

  async deleteAllChannels() {
    return await this.channelsRepository.clear();
  }

  async updateChannel(updateChannelDetails: UpdateChannelDto, id: string) {
    const channelData = await this.getChannelById(id);
    await this.channelsRepository.update(id, {
      ...channelData,
      ...updateChannelDetails,
    });
    return { ...channelData, ...updateChannelDetails };
  }
}
