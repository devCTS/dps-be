import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from './entity/config.entity';
import { UpdateChannelConfigDto } from './dto/update-channel-config.dto';
import { ChannelName, OrderType } from 'src/utils/enum/enum';
import { getChannelData } from './data/channel.data';
import { ChannelListDto } from './dto/channel-list.dto';
import { Merchant } from 'src/merchant/entities/merchant.entity';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Config)
    private readonly configChannelRepository: Repository<Config>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
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

  async getChannelList(body: ChannelListDto) {
    const { orderType, merchantId } = body;
    const channels = await this.configChannelRepository.find();

    const merchant = merchantId
      ? await this.merchantRepository.findOne({
          where: {
            id: merchantId,
          },
          relations: [
            'identity',
            'identity.upi',
            'identity.eWallet',
            'identity.netBanking',
          ],
        })
      : null;

    if (orderType === OrderType.PAYIN) {
      return channels.map((channel) => ({
        channel: channel.name,
        disabled: merchantId
          ? JSON.stringify(merchant?.payinChannels)?.includes(channel.name) &&
            channel.incoming
          : channel.incoming,
      }));
    }

    const mapChannel = {
      UPI: 'upi',
      NET_BANKING: 'netBanking',
      E_WALLET: 'eWallet',
    };

    if (orderType === OrderType.WITHDRAWAL) {
      return channels.map((channel) => ({
        channel: channel.name,
        disabled: merchantId
          ? merchant.identity[mapChannel[channel.name]].length >= 1 &&
            channel.outgoing
          : channel.outgoing,
      }));
    }

    return channels.map((channel) => ({
      channel: channel.name,
      disabled: merchantId
        ? JSON.stringify(merchant?.payoutChannels)?.includes(channel.name) &&
          channel.outgoing
        : channel.outgoing,
    }));
  }
}
