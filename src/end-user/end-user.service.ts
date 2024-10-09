import { Injectable } from '@nestjs/common';
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
    const endUser = await this.endUserRepository.save({ ...createEndUserDto });

    return endUser;
  }
}
