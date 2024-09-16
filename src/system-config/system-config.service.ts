import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { SystemConfig } from './entities/system-config.entity';
import { ChannelProfileFilledField } from 'src/channel/entities/channelProfileFilledField.entity';

import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { ChannelService } from 'src/channel/channel.service';
import { Identity } from 'src/identity/entities/identity.entity';

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
    @InjectRepository(ChannelProfileFilledField)
    private readonly channelProfileFilledFieldRepository: Repository<ChannelProfileFilledField>,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    private readonly channelService: ChannelService,
  ) {}

  async create(createSystemConfigDto: CreateSystemConfigDto) {
    const { defaultTopupChannels, ...remainingSystemConfig } =
      createSystemConfigDto;

    const identity = await this.identityRepository.findOne({
      where: {
        userType: 'SUPER_ADMIN',
      },
    });

    if (!identity) throw new NotFoundException('Identity not found!');

    const systemConfig = await this.systemConfigRepository.save({
      ...remainingSystemConfig,
    });

    if (!systemConfig) throw new InternalServerErrorException();

    await this.channelService.processChannelFilledFields(
      defaultTopupChannels,
      identity,
      systemConfig,
    );

    return HttpStatus.CREATED;
  }

  async findAll() {
    const results = await this.systemConfigRepository.find({
      relations: [
        'defaultPayinGateway',
        'defaultPayoutGateway',
        'defaultWithdrawalGateway',
        'defaultTopupChannels',
      ],
    });

    return results;
  }

  async findLatest() {
    const latestResult = await this.systemConfigRepository.find({
      order: {
        createdAt: 'ASC',
      },
      take: 1,
      relations: [
        'defaultPayinGateway',
        'defaultPayoutGateway',
        'defaultWithdrawalGateway',
        'defaultTopupChannels',
      ],
    });

    return latestResult;
  }

  update(updateSystemConfigDto: UpdateSystemConfigDto) {
    return `This action updates a #systemConfig`;
  }
}
