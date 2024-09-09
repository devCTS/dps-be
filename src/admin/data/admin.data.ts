import { CreateAdminDto } from '../dto/create-admin.dto';

export const getSuperAdminData = (): CreateAdminDto => {
  return {
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD,
    firstName: 'kingsgate',
    lastName: 'dps',
    phone: '+91999999999',
    enabled: true,
    role: 'SUPER_ADMIN',
    permissionAdmins: true,
    permissionUsers: true,
    permissionAdjustBalance: true,
    permissionVerifyOrders: true,
    permissionHandleWithdrawals: true,
  };
};
