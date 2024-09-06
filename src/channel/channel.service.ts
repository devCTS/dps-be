import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel) private channelRepository: Repository<Channel>,
  ) {}

  async create(createChannelDto: CreateChannelDto) {
    const response = await this.channelRepository.save(createChannelDto);
    return {
      data: response,
      status: HttpStatus.CREATED,
      message: 'Channel Created',
    };
  }

  async findAll() {
    const response = await this.channelRepository.find();
    if (response) {
      return {
        totalRecords: response.length,
        data: response,
        status: HttpStatus.OK,
      };
    }
  }

  async findOne(id: number) {
    const response = await this.channelRepository.findOne({ where: { id } });

    if (!response) {
      throw new NotFoundException();
    }

    return {
      data: response,
      status: HttpStatus.FOUND,
      message: 'Record Found',
    };
  }

  async update(id: number, updateChannelDto: UpdateChannelDto) {
    const channel = await this.channelRepository.findOne({ where: { id } });
    if (!channel) throw new NotFoundException();

    const updatedChannel = await this.channelRepository.update(
      channel,
      updateChannelDto,
    );
    if (!updatedChannel) throw new InternalServerErrorException();

    return {
      status: HttpStatus.OK,
    };
  }

  async remove(id: number) {
    const channel = await this.channelRepository.findOne({ where: { id } });
    if (!channel) throw new NotFoundException();

    const response = await this.channelRepository.remove(channel);
    if (!response) throw new InternalServerErrorException();

    return {
      status: HttpStatus.OK,
      message: 'Record Removed',
    };
  }

  async removeAll() {
    const channels = await this.channelRepository.find();
    const response = await this.channelRepository.remove(channels);

    if (!response) throw new InternalServerErrorException();

    return {
      status: HttpStatus.OK,
      message: 'Records Removed',
    };
  }
}
