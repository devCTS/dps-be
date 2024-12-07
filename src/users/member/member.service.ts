import { HttpStatus, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { Repository } from 'typeorm';
import { IdentityService } from '../identity/identity.service';
import { Users } from 'src/utils/enums/users';
import { plainToInstance } from 'class-transformer';
import { MemberDetailsDto } from './dto/response/member-details.dto';
import { UpdateMemberDto } from './dto/request/update-member.dto';
import { CreateMemberDto } from './dto/request/create-member.dto';

@Injectable()
export class MemberService {
  constructor(
    private readonly identityService: IdentityService,

    @InjectRepository(Member) private readonly repository: Repository<Member>,
  ) {}

  async create(createMemberDto: CreateMemberDto) {
    const identity = await this.identityService.createNewUser(
      Users.MEMBER,
      createMemberDto,
    );

    const newData: Partial<Member> = {
      identity: identity,
      ...this.identityService.getDataBodyWithoutIdentity(createMemberDto),
    };

    const created = this.repository.create(newData);
    await this.repository.save(created);

    return HttpStatus.CREATED;
  }

  async update(id: string, updateMemberDto: UpdateMemberDto) {
    const identity = await this.identityService.updateUser(id, updateMemberDto);

    const newData: Partial<Member> = {
      identity: identity,
      ...this.identityService.getDataBodyWithoutIdentity(updateMemberDto),
    };

    await this.repository.update({ identity: { id } }, newData);

    return HttpStatus.OK;
  }

  async findAll() {
    const results = await this.repository.find({ relations: ['identity'] });
    return plainToInstance(MemberDetailsDto, results);
  }
}
