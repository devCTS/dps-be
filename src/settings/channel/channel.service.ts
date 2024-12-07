import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelSettings } from './entities/channel.entity';
import { Repository } from 'typeorm';
import { getChannelData } from './data/channel.data';
import { Channels } from 'src/utils/enums/channels';
import { UpdateChannelSettinngsDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelSettingsService {
  constructor(
    @InjectRepository(ChannelSettings)
    private readonly repository: Repository<ChannelSettings>,
  ) {}

  async createChannelSettings() {
    const isChannelConfigExists = await this.repository.find();

    if (isChannelConfigExists?.length > 0)
      throw new ConflictException('Channels are already created.');

    const chanelConfigData = getChannelData();

    const channelConfigs = chanelConfigData.map((dto) => {
      const config = this.repository.create(dto);
      return config;
    });

    await this.repository.save(channelConfigs);
  }

  async updateChannelSettings(
    name: Channels,
    updateChannelSettingsDto: UpdateChannelSettinngsDto,
  ) {
    const existingConfig = await this.repository.findOneBy({
      name: name,
    });

    if (!existingConfig) throw new NotFoundException('Channel not found');

    existingConfig.incoming = updateChannelSettingsDto.incoming;
    existingConfig.outgoing = updateChannelSettingsDto.outgoing;
    existingConfig.tagName = updateChannelSettingsDto.tagName;

    await this.repository.save(existingConfig);

    return HttpStatus.ACCEPTED;
  }

  async getAllChannelSettings() {
    return await this.repository.find({});
  }

  async getChannelSettings(name: Channels) {
    const config = await this.repository.findOneBy({
      name: name,
    });

    if (!config) throw new NotFoundException('Confuguration not found.');

    return config;
  }
}
