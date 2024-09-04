import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Identity } from './identity.entity';
import { Repository } from 'typeorm';
import { IdentityRegisterDto } from './dto/identity.dto';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
  ) {}

  // Get identity by user name
  async getIdentityByUserName(user_name: string) {
    return await this.identityRepository.findOneBy({ user_name });
  }

  // Register identity
  async registerIdentity(registerIdentityData: IdentityRegisterDto) {
    return this.identityRepository.save(registerIdentityData);
  }
}
