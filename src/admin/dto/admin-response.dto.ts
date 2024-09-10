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
  firstName: string;

  @Expose()
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
  permissionAdmins: boolean;

  @Expose()
  permissionUsers: boolean;

  @Expose()
  permissionAdjustBalance: boolean;

  @Expose()
  permissionVerifyOrders: boolean;

  @Expose()
  permissionHandleWithdrawals: boolean;

  @Expose()
  @DateFormat()
  createdAt: Date;

  @Expose()
  @DateFormat()
  updatedAt: Date;
}
