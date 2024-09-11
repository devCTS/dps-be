import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsValidPassword } from 'src/utils/decorators/validPassword.decorator';
import { IsValidPhoneNumber } from 'src/utils/decorators/validPhoneNumber';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail(undefined, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsValidPassword()
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  @IsValidPhoneNumber()
  phone: string;

  @IsEnum(['SUPER_ADMIN', 'SUB_ADMIN'])
  @IsNotEmpty()
  role: 'SUPER_ADMIN' | 'SUB_ADMIN';

  @IsBoolean()
  @IsNotEmpty()
  enabled: boolean;

  @IsBoolean()
  @IsNotEmpty()
  permissionAdmins: boolean;

  @IsBoolean()
  @IsNotEmpty()
  permissionUsers: boolean;

  @IsBoolean()
  @IsNotEmpty()
  permissionAdjustBalance: boolean;

  @IsBoolean()
  @IsNotEmpty()
  permissionVerifyOrders: boolean;

  @IsBoolean()
  @IsNotEmpty()
  permissionHandleWithdrawals: boolean;

  @IsBoolean()
  @IsNotEmpty()
  permissionSystemConfig: boolean;

  @IsBoolean()
  @IsNotEmpty()
  permissionChannelsAndGateways: boolean;
}
