import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { Exclude, Expose, Transform } from 'class-transformer';
import { Identity } from 'src/identity/entities/identity.entity';
import { Rename } from 'src/utils/decorators/rename.decorator';
import { DateFormat } from 'src/utils/decorators/dateformat.decorator';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

@Exclude()
export class SubMerchantResponseDto {
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
  id: number;

  @Expose()
  @IsBoolean()
  enabled: boolean;

  @Expose()
  @DateFormat()
  createdAt: Date;

  @Expose()
  @DateFormat()
  updatedAt: Date;

  @Expose()
  @IsBoolean()
  permissionSubmitPayouts: boolean;

  @Expose()
  @IsBoolean()
  permissionSubmitWithdrawals: boolean;

  @Expose()
  @IsBoolean()
  permissionUpdateWithdrawalProfiles: boolean;

  @IsString()
  @IsNotEmpty()
  merchantName: string;

  @IsString()
  @IsNotEmpty()
  businessName: string;
}
