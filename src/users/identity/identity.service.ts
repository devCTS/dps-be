import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateIdentityDto } from './dto/request/create-identity.dto';
import { UpdateIdentityDto } from './dto/request/update-identity.dto';
import { IdentityRepository } from './identity.repository';
import { Users } from 'src/utils/enums/users';
import { Identity } from './entities/identity.entity';
import Errors from 'src/utils/errors';
import { JwtService } from 'src/integrations/jwt/jwt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { AdminDetailsDto } from '../admin/dto/response/admin-details.dto';
import { AgentDetailsDto } from '../agent/dto/response/agent-details.dto';
import { MemberDetailsDto } from '../member/dto/response/member-details.dto';
import {
  getUserResponseDto,
  getUserTable,
} from 'src/dashboard/paginate/paginate.util';

@Injectable()
export class IdentityService {
  constructor(
    private readonly repository: IdentityRepository,
    private readonly jwtService: JwtService,
  ) {}

  getDataBodyForIdentity(data) {
    const { email, password, firstName, lastName, phone, enabled } = data;

    return { email, password, firstName, lastName, phone, enabled };
  }

  getDataBodyWithoutIdentity(data) {
    const newBody = { ...data };
    delete newBody.email;
    delete newBody.password;
    delete newBody.firstName;
    delete newBody.lastName;
    delete newBody.phone;
    delete newBody.enabled;

    return newBody;
  }

  async createNewUser(userType: Users, createIdentityDto: CreateIdentityDto) {
    const existingIdentity = await this.repository.findByEmail(
      createIdentityDto.email,
    );

    if (existingIdentity) {
      throw new ConflictException(Errors.USER_EXISTS);
    }

    const data = this.getDataBodyForIdentity(createIdentityDto);

    const hashedPassword = this.jwtService.getHashPassword(data.password);

    const identityData: Partial<Identity> = {
      ...data,
      userType,
      password: hashedPassword,
    };

    const identity = await this.repository.createNewUser(identityData);
    return identity;
  }

  async updateUser(id: string, updateIdentityDto: UpdateIdentityDto) {
    if (updateIdentityDto.email) {
      const existingIdentity = await this.repository.findByEmail(
        updateIdentityDto.email,
      );

      if (existingIdentity && existingIdentity.id !== id) {
        throw new ConflictException(Errors.USER_EXISTS);
      }
    }

    const data = this.getDataBodyForIdentity(updateIdentityDto);

    let updated = null;
    if (updateIdentityDto.password) {
      const hashedPassword = this.jwtService.getHashPassword(data.password);
      updated = await this.repository.updateUser(id, {
        ...data,
        password: hashedPassword,
      });
    } else {
      updated = await this.repository.updateUser(id, data);
    }

    return updated;
  }

  async getUserDetails(id: string) {
    const identityUser = await this.repository.getUser(id);

    if (!identityUser) throw new NotFoundException();

    let userTable = getUserTable(identityUser.userType);
    let userResponse = getUserResponseDto(identityUser.userType);

    const user = { ...identityUser[userTable] };
    delete identityUser[userTable];
    user.identity = identityUser;

    return plainToClass(userResponse, user);
  }
}
