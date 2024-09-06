import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { SubMerchant } from './entities/sub-merchant.entity';
import { EntityManager, Repository } from 'typeorm';
import { IdentityService } from 'src/identity/identity.service';
import {
  SubMerchantRegisterDto,
  SubMerchantUpdateDto,
} from './dto/sub-merchant.dto';
import { encryptPassword } from 'src/utils/utils';
import { Identity } from 'src/identity/entities/identity.entity';

@Injectable()
export class SubMerchantService {
  constructor(
    @InjectRepository(SubMerchant)
    private subMerchantRepository: Repository<SubMerchant>,
    private identityService: IdentityService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  // Get merchant by Identity id
  async getSubMerchantByIdentityId(identity_id: number) {
    return await this.subMerchantRepository.findOne({
      where: { identity: { id: identity_id } },
    });
  }

  // Register merchant
  async registerSubMerchant(subMerchatRegisterData: SubMerchantRegisterDto) {
    const { email, password, user_name, phone, first_name, last_name } =
      subMerchatRegisterData;

    const subMerchantIdentity =
      await this.identityService.getIdentityByUserName(user_name);

    if (subMerchantIdentity) {
      throw new ConflictException('Identity already exists. Please Login');
    }

    const hashedPassword = await encryptPassword(password);

    const data = await this.identityService.registerIdentity({
      email,
      password: hashedPassword,
      user_name,
    });

    await this.subMerchantRepository.save({
      phone,
      first_name,
      last_name,
      identity: data,
    });

    return {
      subMerchatRegisterData,
      status: HttpStatus.CREATED,
      message: 'Sub-Merchant created.',
    };
  }

  // Update merchant details
  async updateSubMerchantDetails(
    subMerchantUpdateData: SubMerchantUpdateDto,
    user_name: string,
  ) {
    const subMerchantIdentity =
      await this.identityService.getIdentityByUserName(user_name);
    if (!subMerchantIdentity) {
      throw new NotFoundException('Sub-Merchant account not found.');
    }

    const subMerchantdata = await this.getSubMerchantByIdentityId(
      subMerchantIdentity.id,
    );

    await this.subMerchantRepository.update(subMerchantdata.id, {
      ...subMerchantdata,
      ...subMerchantUpdateData,
    });

    return { message: 'Sub-Merchant data updated.', subMerchantUpdateData };
  }

  // Get merchant details by user name
  async getSubMerchantByUserName(user_name: string) {
    const subMerchantIdentity =
      await this.identityService.getIdentityByUserName(user_name);

    if (!subMerchantIdentity) {
      throw new NotFoundException('Sub-Merchant not found.');
    }

    const subMerchantData = await this.getSubMerchantByIdentityId(
      subMerchantIdentity.id,
    );
    delete subMerchantData.identity;
    delete subMerchantIdentity.password;
    return { ...subMerchantIdentity, ...subMerchantData };
  }

  // Get all merchant
  async getAllSubMerchants() {
    return await this.subMerchantRepository.find();
  }

  // Delete all merchants
  async deleteAllSubMerchants() {
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      // Fetch all merchants with their identities
      const subMerchants = await transactionalEntityManager.find(SubMerchant, {
        relations: ['identity'],
      });
      // Remove all identities first to avoid foreign key issues
      for (const subMerchant of subMerchants) {
        if (subMerchant.identity) {
          await transactionalEntityManager.remove(
            Identity,
            subMerchant.identity,
          );
        }
      }
      // Remove all merchants
      await transactionalEntityManager.clear(SubMerchant);
      return { message: 'All Sub-merchants deleted' };
    });
  }
}
