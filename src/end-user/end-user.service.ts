import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EndUser } from './entities/end-user.entity';
import { Repository } from 'typeorm';
import { CreateEndUserDto } from './dto/create-end-user.dto';

@Injectable()
export class EndUserService {
  constructor(
    @InjectRepository(EndUser)
    private readonly endUserRepository: Repository<EndUser>,
  ) {}

  async create(createEndUserDto: CreateEndUserDto) {
    const { channelDetails } = createEndUserDto;

    const channelDetailsJson = JSON.stringify(channelDetails);

    const endUser = await this.endUserRepository.save({
      channelDetails: channelDetailsJson,
      ...createEndUserDto,
    });

    return endUser;
  }

  async findOne(id) {
    const endUser = await this.endUserRepository.findOne({
      where: { id },
      relations: [],
    });

    if (!endUser) throw new NotFoundException('End user not found!');

    endUser.channelDetails = JSON.parse(endUser.channelDetails);

    return endUser;
  }

  async findAll() {
    const endUsers = await this.endUserRepository.find({
      relations: [],
    });

    endUsers.forEach((endUser) => {
      endUser.channelDetails = JSON.parse(endUser.channelDetails);
    });

    return endUsers;
  }
}
