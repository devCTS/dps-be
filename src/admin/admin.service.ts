import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { EntityManager, Repository } from 'typeorm';
import { IdentityService } from 'src/identity/identity.service';
import { AdminRegisterDto, AdminUpdateDto } from './dto/admin.dto';
import { encryptPassword } from 'src/utils/utils';
import { Identity } from 'src/identity/entities/identity.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private identityService: IdentityService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  // Get Admin by Identity id
  async getAdminByIdentityId(identity_id: number) {
    return await this.adminRepository.findOne({
      where: { identity: { id: identity_id } },
    });
  }

  // Register Admin
  async registerAdmin(adminRegisterData: AdminRegisterDto) {
    const { email, password, user_name, phone, first_name, last_name } =
      adminRegisterData;

    const adminIdentity =
      await this.identityService.getIdentityByUserName(user_name);

    if (adminIdentity) {
      throw new ConflictException('Identity already exists. Please Login');
    }

    const hashedPassword = await encryptPassword(password);

    const data = await this.identityService.registerIdentity({
      email,
      password: hashedPassword,
      user_name,
    });

    await this.adminRepository.save({
      phone,
      first_name,
      last_name,
      identity: data,
    });

    return {
      adminRegisterData,
      status: HttpStatus.CREATED,
      message: 'Admin created.',
    };
  }

  // Update Admin details
  async updateAdminDetails(adminUpdateData: AdminUpdateDto, user_name: string) {
    const adminIdentity =
      await this.identityService.getIdentityByUserName(user_name);
    if (!adminIdentity) {
      throw new NotFoundException('Admin account not found.');
    }

    const Admindata = await this.getAdminByIdentityId(adminIdentity.id);

    await this.adminRepository.update(Admindata.id, {
      ...Admindata,
      ...adminUpdateData,
    });

    return { message: 'Admin data updated.', adminUpdateData };
  }

  // Get Admin details by user name
  async getAdminByUserName(user_name: string) {
    const adminIdentity =
      await this.identityService.getIdentityByUserName(user_name);

    if (!adminIdentity) {
      throw new NotFoundException('Admin not found.');
    }

    const adminData = await this.getAdminByIdentityId(adminIdentity.id);
    delete adminData.identity;
    delete adminIdentity.password;
    return { ...adminIdentity, ...adminData };
  }

  // Get all Admin
  async getAllAdmins() {
    return await this.adminRepository.find();
  }

  // Delete all Admins
  async deleteAllAdmins() {
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      // Fetch all Admins with their identities
      const admins = await transactionalEntityManager.find(Admin, {
        relations: ['identity'],
      });
      // Remove all identities first to avoid foreign key issues
      for (const admin of admins) {
        if (admin.identity) {
          await transactionalEntityManager.remove(Identity, admin.identity);
        }
      }
      // Remove all Admins
      await transactionalEntityManager.clear(Admin);
      return { message: 'All Admins deleted' };
    });
  }
}
