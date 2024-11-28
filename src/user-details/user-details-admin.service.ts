import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserDetailsAdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async getAdminDetails(userId: string) {
    const admin = await this.adminRepository.findOne({
      where: { id: userId },
      relations: ['identity'],
    });
    if (!admin) throw new NotFoundException('Request admin not found!');

    return {
      name: admin.firstName + ' ' + admin.lastName,
      role: admin.role,
      email: admin.identity.email,
      phone: admin.phone,
      joinedOn: admin.createdAt,
      status: admin.enabled,
      canAddOtherAdmin: admin.permissionAdmins,
      canAddOtherUsers: admin.permissionUsers,
      canVerifyOrders: admin.permissionVerifyOrders,
      canHandleWithdrawalOrders: admin.permissionHandleWithdrawals,
      canDoManualAdjustment: admin.permissionAdjustBalance,
      canUpdateSystemConfig: admin.permissionSystemConfig,
      canUpdateChannelsAndGateways: admin.permissionChannelsAndGateways,
    };
  }
}
