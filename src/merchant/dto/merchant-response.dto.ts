import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { Exclude, Expose, Transform } from 'class-transformer';
import { Identity } from 'src/identity/entities/identity.entity';
import { Rename } from 'src/utils/decorators/rename.decorator';
import { DateFormat } from 'src/utils/decorators/dateformat.decorator';

@Exclude()
export class MerchantResponseDto {
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
  enabled: boolean;

  @Expose()
  @DateFormat()
  createdAt: Date;

  @Expose()
  @DateFormat()
  updatedAt: Date;
}
