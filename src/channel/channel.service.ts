import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { Repository, Between } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { ChannelResponseDto } from './dto/channel-response.dto';
import { ChannelProfileField } from './entities/channelProfileField.entity';
import { ChannelProfileFilledField } from './entities/channelProfileFilledField.entity';
import { Identity } from 'src/identity/entities/identity.entity';
import { ChannelProfileDto } from 'src/utils/dtos/channel-profile.dto';
import { PayinPayoutChannel } from './entities/payinPayoutChannel.entity';
import { parseEndDate, parseStartDate } from 'src/utils/dtos/paginate.dto';
import { SystemConfig } from 'src/system-config/entities/system-config.entity';
@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(ChannelProfileField)
    private readonly profileFieldRepository: Repository<ChannelProfileField>,

    @InjectRepository(ChannelProfileFilledField)
    private readonly filledFieldRepository: Repository<ChannelProfileFilledField>,

    @InjectRepository(PayinPayoutChannel)
    private readonly payinPayoutChannelRepository: Repository<PayinPayoutChannel>,
  ) {}

  async findByTag(tag: string): Promise<Channel | null> {
    return this.channelRepository.findOne({ where: { tag } });
  }

  async create(
    createChannelDto: CreateChannelDto,
  ): Promise<ChannelResponseDto> {
    let existingChannel = await this.channelRepository.findOne({
      where: { tag: createChannelDto.tag },
    });

    if (existingChannel) {
      throw new ConflictException(
        'A channel with the same tag already exists.',
      );
    }

    existingChannel = await this.channelRepository.findOne({
      where: { name: createChannelDto.name },
    });

    if (existingChannel) {
      throw new ConflictException(
        'A channel with the same name already exists.',
      );
    }

    const channel = this.channelRepository.create(createChannelDto);
    const createdChannel = await this.channelRepository.save(channel);

    // Create Profile Fields entities
    const profileFieldEntities = createChannelDto.profileFields.map((field) => {
      const profileField = this.profileFieldRepository.create({
        ...field,
        channel: createdChannel,
      });
      return profileField;
    });

    // Save Profile Fields
    await this.profileFieldRepository.save(profileFieldEntities);

    // Return the saved Channel with its profile fields

    return plainToInstance(ChannelResponseDto, createdChannel);
  }

  async findAll(): Promise<ChannelResponseDto[]> {
    const results = await this.channelRepository.find({
      relations: ['profileFields'],
    });

    return plainToInstance(ChannelResponseDto, results);
  }

  async findOne(id: number): Promise<ChannelResponseDto> {
    const results = await this.channelRepository.findOne({
      where: { id: id },
      relations: ['profileFields'],
    });

    return plainToInstance(ChannelResponseDto, results);
  }

  async update(id: number, updateDto: UpdateChannelDto): Promise<HttpStatus> {
    delete updateDto.profileFields;
    await this.channelRepository.findOneBy({ id });

    return HttpStatus.OK;
  }

  async processChannelFilledFields(
    channelProfile: ChannelProfileDto[],
    identity: Identity,
    systemConfig: SystemConfig = null,
  ) {
    // Delete previous
    if (!channelProfile || channelProfile.length < 1) return;

    await this.filledFieldRepository.delete({ identity: { id: identity.id } });

    for (const channelProfileObj of channelProfile) {
      // Find the channel based on channelId
      const channel = await this.channelRepository.findOne({
        where: { id: channelProfileObj.channelId },
      });
      if (!channel) {
        throw new Error('Channel not found');
      }

      // Process the profile fields for the channel
      for (const field of channelProfileObj.profileFields) {
        const profileField = await this.profileFieldRepository.findOne({
          where: { id: field.fieldId },
        });
        const filledField = new ChannelProfileFilledField();
        filledField.field = profileField;
        filledField.fieldValue = field.value;
        filledField.identity = identity;
        filledField.defaultTopupChannels = systemConfig;
        await this.filledFieldRepository.save(filledField);
      }
    }
  }

  async deleteChannelProfileOfUser(identity: Identity) {
    await this.filledFieldRepository.delete({ identity: { id: identity.id } });
  }

  async updatePayinPayoutChannels(
    identity: Identity,
    channelIds: number[],
    type: 'Payout' | 'Payin',
  ): Promise<PayinPayoutChannel[]> {
    // Step 1: Delete existing channels associated with the identity

    await this.payinPayoutChannelRepository.delete({ identity, type });

    // Step 2: Create new PayinPayoutChannel entities
    const channelEntities: PayinPayoutChannel[] = [];

    for (const channelId of channelIds) {
      const channel = await this.channelRepository.findOne({
        where: { id: channelId },
      });

      const payinPayoutChannel = new PayinPayoutChannel();
      payinPayoutChannel.channel = channel;
      payinPayoutChannel.identity = identity;
      payinPayoutChannel.type = type;

      channelEntities.push(payinPayoutChannel);
    }

    // Step 3: Save all new PayinPayoutChannel entities in bulk
    return this.payinPayoutChannelRepository.save(channelEntities);
  }

  async deletePayinPayoutChannels(identity: Identity) {
    await this.payinPayoutChannelRepository.delete({ identity });
  }

  async exportRecords(startDate: string, endDate: string) {
    startDate = parseStartDate(startDate);
    endDate = parseEndDate(endDate);

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    const [rows, total] = await this.channelRepository.findAndCount({
      relations: ['profileFields'],
      where: {
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    const dtos = plainToInstance(ChannelResponseDto, rows);

    return {
      data: dtos,
      total,
    };
  }
}
