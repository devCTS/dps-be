import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Merchant } from './merchant.entity';
import { Repository } from 'typeorm';
import { IdentityService } from 'src/identity/identity.service';
import { MerchantRegisterDto, MerchantUpdateDto } from './dto/merchant.dt';
import { encryptPassword } from 'src/utils/utils';

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    private identityService: IdentityService,
  ) {}

  // Get merchant by Identity id
  async getMerchantByIdentityId(identity_id: string) {
    return await this.merchantRepository.findOneBy({});
  }

  // Register merchant
  async registerMerchant(merchatRegisterData: MerchantRegisterDto) {
    const { email, password, user_name, phone, first_name, last_name } =
      merchatRegisterData;

    const merchantIdentity =
      await this.identityService.getIdentityByUserName(user_name);

    if (merchantIdentity) {
      throw new ConflictException('Identity already exists. Please Login');
    }

    const hashedPassword = await encryptPassword(password);

    const data = await this.identityService.registerIdentity({
      email,
      password: hashedPassword,
      user_name,
    });

    await this.merchantRepository.save({
      phone,
      first_name,
      last_name,
      identity: data,
    });

    return {
      merchatRegisterData,
      status: HttpStatus.CREATED,
      message: 'Merchant created.',
    };
  }

  // Update merchant details
  async updateMerchantDetails(
    merchantUpdateData: MerchantUpdateDto,
    user_name: string,
  ) {
    const merchantIdentity =
      await this.identityService.getIdentityByUserName(user_name);
    if (!merchantIdentity) {
      throw new NotFoundException('Merchant account not found.');
    }
    const merchantdata = await this.merchantRepository.findOne({
      where: { identity: { id: merchantIdentity.id } },
      relations: {
        identity: true,
      },
    });
    await this.merchantRepository.update(merchantdata.id, {
      ...merchantdata,
      ...merchantUpdateData,
    });

    return { message: 'Merchant data updated.', merchantUpdateData };
  }
}
