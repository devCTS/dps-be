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
  @Rename('first_name')
  firstName: string;

  @Expose()
  @Rename('last_name')
  lastName: string;

  @Expose()
  phone: string;

  @Expose()
  id: number;

  @Expose()
  enabled: boolean;

  @Expose()
  @Rename('created_at')
  @DateFormat()
  createdAt: Date;

  @Expose()
  @Rename('updated_at')
  @DateFormat()
  updatedAt: Date;
}
