import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from './entity/config.entity';
import { UpdateChannelConfigDto } from './dto/update-channel-config.dto';
import { ChannelName } from 'src/utils/enum/enum';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Config)
    private readonly configChannelRepository: Repository<Config>,
  ) {}

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
    return await this.configChannelRepository.find();
  }

  async getConfig(name: ChannelName) {
    const config = await this.configChannelRepository.findOneBy({
      name: name,
    });

    if (!config) throw new NotFoundException('Confuguration not found.');

    return config;
  }
}
