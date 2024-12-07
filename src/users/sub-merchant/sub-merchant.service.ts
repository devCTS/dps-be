import { HttpStatus, Injectable } from '@nestjs/common';

import { SubMerchant } from './entities/sub-merchant.entity';
import { plainToInstance } from 'class-transformer';
import { SubMerchantDetailsDto } from './dto/response/sub-merchant-details.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IdentityService } from '../identity/identity.service';
import { Repository } from 'typeorm';
import { Users } from 'src/utils/enums/users';
import { CreateSubMerchantDto } from './dto/request/create-sub-merchant.dto';
import { UpdateSubMerchantDto } from './dto/request/update-sub-merchant.dto';

@Injectable()
export class SubMerchantService {
  constructor(
    private readonly identityService: IdentityService,

    @InjectRepository(SubMerchant)
    private readonly repository: Repository<SubMerchant>,
  ) {}

  async create(createSubMerchantDto: CreateSubMerchantDto) {
    const identity = await this.identityService.createNewUser(
      Users.SUB_MERCHANT,
      createSubMerchantDto,
    );

    const newData: Partial<SubMerchant> = {
      identity: identity,
      ...this.identityService.getDataBodyWithoutIdentity(createSubMerchantDto),
    };

    const created = this.repository.create(newData);
    await this.repository.save(created);

    return HttpStatus.CREATED;
  }

  async update(id: string, updateSubMerchantDto: UpdateSubMerchantDto) {
    const identity = await this.identityService.updateUser(
      id,
      updateSubMerchantDto,
    );

    const newData: Partial<SubMerchant> = {
      identity: identity,
      ...this.identityService.getDataBodyWithoutIdentity(updateSubMerchantDto),
    };

    await this.repository.update({ identity: { id } }, newData);

    return HttpStatus.OK;
  }

  async findAll() {
    const results = await this.repository.find({ relations: ['identity'] });
    return plainToInstance(SubMerchantDetailsDto, results);
  }
}
