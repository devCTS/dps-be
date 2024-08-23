import { Injectable } from '@nestjs/common';
import { RegisterIdentityDto } from './dto/identity.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Identity } from './identity.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
  ) {}

  async registerIdentity(identityDetails: RegisterIdentityDto) {
    return await this.identityRepository.save(identityDetails);
  }

  async getIdentityByEmail(email: string) {
    return await this.identityRepository.findOneBy({ email });
  }
}
