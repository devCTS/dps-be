import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { Exclude, Expose, Transform } from 'class-transformer';
import { Identity } from 'src/identity/entities/identity.entity';
import { Admin } from '../entities/admin.entity';
import { Rename } from 'src/utils/decorators/rename.decorator';
import { DateFormat } from 'src/utils/decorators/dateformat.decorator';

@Exclude()
export class AdminResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.identity.email, { toClassOnly: true })
  email: string;

  @Exclude()
  identity: Identity;

  @Expose()
  @Rename('first_name')
  firstName: string;

  @Expose()
  @Rename('last_name')
  lastName: string;

  @Expose()
  phone: string;

  @Expose()
  role: 'SUPER_ADMIN' | 'SUB_ADMIN';

  @Expose()
  id: number;

  @Expose()
  enabled: boolean;

  @Expose()
  @Rename('permission_admins')
  permissionAdmins: boolean;

  @Expose()
  @Rename('permission_users')
  permissionUsers: boolean;

  @Expose()
  @Rename('permission_adjust_balance')
  permissionAdjustBalance: boolean;

  @Expose()
  @Rename('permission_verify_orders')
  permissionVerifyOrders: boolean;

  @Expose()
  @Rename('permission_handle_withdrawals')
  permissionHandleWithdrawals: boolean;

  @Expose()
  @Rename('created_at')
  @DateFormat()
  createdAt: Date;

  @Expose()
  @Rename('updated_at')
  @DateFormat()
  updatedAt: Date;
}
