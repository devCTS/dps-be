import { HttpStatus, Injectable } from '@nestjs/common';
import { IdentityService } from '../identity/identity.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Merchant } from './entities/merchant.entity';
import { Repository } from 'typeorm';
import { Users } from 'src/utils/enums/users';
import { plainToInstance } from 'class-transformer';
import { MerchantDetailsDto } from './dto/response/merchant-details.dto';
import { UpdateMerchantDto } from './dto/request/update-merchant.dto';
import { CreateMerchantDto } from './dto/request/create-merchant.dto';
import { JwtService } from 'src/integrations/jwt/jwt.service';

@Injectable()
export class MerchantService {
  constructor(
    private readonly identityService: IdentityService,
    @InjectRepository(Merchant)
    private readonly repository: Repository<Merchant>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createMerchantDto: CreateMerchantDto) {
    const identity = await this.identityService.createNewUser(
      Users.MERCHANT,
      createMerchantDto,
    );

    const hashedPassword = this.jwtService.getHashPassword(
      createMerchantDto.withdrawalPassword,
    );

    const newData: Partial<Merchant> = {
      identity: identity,
      ...this.identityService.getDataBodyWithoutIdentity(createMerchantDto),
      withdrawalPassword: hashedPassword,
    };

    const created = this.repository.create(newData);
    await this.repository.save(created);

    return HttpStatus.CREATED;
  }

  async update(id: string, updateMerchantDto: UpdateMerchantDto) {
    const identity = await this.identityService.updateUser(
      id,
      updateMerchantDto,
    );

    const newData: Partial<Merchant> = {
      identity: identity,
      ...this.identityService.getDataBodyWithoutIdentity(updateMerchantDto),
    };

    if (updateMerchantDto.withdrawalPassword) {
      const hashedPassword = this.jwtService.getHashPassword(
        updateMerchantDto.withdrawalPassword,
      );
      await this.repository.update(
        { identity: { id } },
        { ...newData, withdrawalPassword: hashedPassword },
      );
    } else {
      await this.repository.update({ identity: { id } }, newData);
    }

    return HttpStatus.OK;
  }

  async findAll() {
    const results = await this.repository.find({ relations: ['identity'] });
    return plainToInstance(MerchantDetailsDto, results);
  }
}
