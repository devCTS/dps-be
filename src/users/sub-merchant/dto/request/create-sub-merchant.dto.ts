import { IsBoolean, IsEnum } from 'class-validator';
import { CreateIdentityDto } from 'src/users/identity/dto/request/create-identity.dto';
import { AdminRoles } from 'src/utils/enums/users';

export class CreateSubMerchantDto extends CreateIdentityDto {
  @IsBoolean()
  permissionSubmitPayouts: boolean;

  @IsBoolean()
  permissionSubmitWithdrawals: boolean;

  @IsBoolean()
  permissionUpdateWithdrawalProfiles: boolean;
}
