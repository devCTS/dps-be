import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/request/create-admin.dto';
import { UpdateAdminDto } from './dto/request/update-admin.dto';
import { IdentityService } from '../identity/identity.service';
import { Users } from 'src/utils/enums/users';
import { Admin } from './entities/admin.entity';

import { plainToInstance } from 'class-transformer';
import { AdminDetailsDto } from './dto/response/admin-details.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    private readonly identityService: IdentityService,

    @InjectRepository(Admin) private readonly repository: Repository<Admin>,
  ) {}

  async create(createAdminDto: CreateAdminDto) {
    const identity = await this.identityService.createNewUser(
      Users.ADMIN,
      createAdminDto,
    );

    const newAdminData: Partial<Admin> = {
      identity: identity,
      ...this.identityService.getDataBodyWithoutIdentity(createAdminDto),
    };

    const created = this.repository.create(newAdminData);
    await this.repository.save(created);

    return HttpStatus.CREATED;
  }

  async update(id: string, updateAdminDto: UpdateAdminDto) {
    const identity = await this.identityService.updateUser(id, updateAdminDto);

    const newAdminData: Partial<Admin> = {
      identity: identity,
      ...this.identityService.getDataBodyWithoutIdentity(updateAdminDto),
    };

    await this.repository.update({ identity: { id } }, newAdminData);

    return HttpStatus.OK;
  }

  async findAll() {
    const admins = await this.repository.find({ relations: ['identity'] });
    return plainToInstance(AdminDetailsDto, admins);
  }
}
