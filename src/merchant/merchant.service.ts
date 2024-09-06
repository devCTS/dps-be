import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Merchant } from './entities/merchant.entity';
import { EntityManager, Repository } from 'typeorm';
import { IdentityService } from 'src/identity/identity.service';
import { MerchantRegisterDto, MerchantUpdateDto } from './dto/merchant.dto';
import { encryptPassword } from 'src/utils/utils';
import { Identity } from 'src/identity/entities/identity.entity';

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    private identityService: IdentityService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  // Get merchant by Identity id
  async getMerchantByIdentityId(identity_id: number) {
    return await this.merchantRepository.findOne({
      where: { identity: { id: identity_id } },
    });
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
      user_type: 'merchant',
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

    const merchantdata = await this.getMerchantByIdentityId(
      merchantIdentity.id,
    );

    await this.merchantRepository.update(merchantdata.id, {
      ...merchantdata,
      ...merchantUpdateData,
    });

    return { message: 'Merchant data updated.', merchantUpdateData };
  }

  // Get merchant details by user name
  async getMerchantByUserName(user_name: string) {
    const merchantIdentity =
      await this.identityService.getIdentityByUserName(user_name);

    if (!merchantIdentity) {
      throw new NotFoundException('Merchant not found.');
    }

    const merchantData = await this.getMerchantByIdentityId(
      merchantIdentity.id,
    );
    delete merchantData.identity;
    delete merchantIdentity.password;
    return { ...merchantIdentity, ...merchantData };
  }

  // Get all merchant
  async getAllMerchants() {
    return await this.merchantRepository.find();
  }

  // Delete all merchants
  async deleteAllMerchants() {
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      // Fetch all merchants with their identities
      const merchants = await transactionalEntityManager.find(Merchant, {
        relations: ['identity'],
      });
      // Remove all identities first to avoid foreign key issues
      for (const merchant of merchants) {
        if (merchant.identity) {
          await transactionalEntityManager.remove(Identity, merchant.identity);
        }
      }
      // Remove all merchants
      await transactionalEntityManager.clear(Merchant);
      return { message: 'All merchants deleted' };
    });
  }
}
