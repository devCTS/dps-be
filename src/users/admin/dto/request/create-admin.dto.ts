import { IsBoolean, IsEnum } from 'class-validator';
import { CreateIdentityDto } from 'src/users/identity/dto/request/create-identity.dto';
import { AdminRoles } from 'src/utils/enums/users';

export class CreateAdminDto extends CreateIdentityDto {
  @IsEnum(AdminRoles)
  role: AdminRoles;

  @IsBoolean()
  permissionAdmins: boolean;

  @IsBoolean()
  permissionUsers: boolean;

  @IsBoolean()
  permissionAdjustBalance: boolean;

  @IsBoolean()
  permissionVerifyOrders: boolean;

  @IsBoolean()
  permissionHandleWithdrawals: boolean;

  @IsBoolean()
  permissionSystemConfig: boolean;

  @IsBoolean()
  permissionChannelsAndGateways: boolean;
}
