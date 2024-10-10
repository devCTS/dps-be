import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from './entity/config.entity';
import { UpdateChannelConfigDto } from './dto/update-channel-config.dto';
import { ChannelName } from 'src/utils/enum/enum';
import { getChannelData } from './data/channel.data';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Config)
    private readonly configChannelRepository: Repository<Config>,
  ) {}

  async createChannelConfig() {
    const isChannelConfigExists = await this.configChannelRepository.find();

    if (isChannelConfigExists?.length > 0)
      throw new ConflictException('Channels are already created.');

    const chanelConfigData = getChannelData();

    const channelConfigs = chanelConfigData.map((dto) => {
      const config = this.configChannelRepository.create(dto);
      return config;
    });

    await this.configChannelRepository.save(channelConfigs);

    return HttpStatus.OK;
  }

  async updateChannelConfig(updateChannelConfigDto: UpdateChannelConfigDto) {
    const name = updateChannelConfigDto.name;

    const existingConfig = await this.configChannelRepository.findOneBy({
      name: name,
    });

    delete updateChannelConfigDto.name;

    if (!existingConfig) throw new NotFoundException('Channel not found');

    existingConfig.incoming = updateChannelConfigDto.incoming;
    existingConfig.outgoing = updateChannelConfigDto.outgoing;

    await this.configChannelRepository.save(existingConfig);

    return HttpStatus.ACCEPTED;
  }

  async getAllConfig() {
    return await this.configChannelRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async getConfig(name: ChannelName) {
    const config = await this.configChannelRepository.findOneBy({
      name: name,
    });

    if (!config) throw new NotFoundException('Confuguration not found.');

    return config;
  }
}
