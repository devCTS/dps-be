import { ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { ChannelResponseDto } from './dto/channel-response.dto';
import { ChannelProfileField } from './entities/channelProfileField.entity';
@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(ChannelProfileField)
    private readonly profileFieldRepository: Repository<ChannelProfileField>,
  ) {}

  async findByTag(tag: string): Promise<Channel | null> {
    return this.channelRepository.findOne({ where: { tag } });
  }

  async create(
    createChannelDto: CreateChannelDto,
  ): Promise<ChannelResponseDto> {
    const existingChannel = await this.findByTag(createChannelDto.tag);
    if (existingChannel) {
      throw new ConflictException(
        'A channel with the same tag already exists.',
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
    const result = await this.channelRepository.update({ id: id }, updateDto);
    return HttpStatus.OK;
  }
}
