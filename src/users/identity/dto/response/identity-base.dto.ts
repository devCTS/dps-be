import { Exclude, Expose, Transform } from 'class-transformer';
import { DateFormat } from 'src/utils/decorators/dateformat.decorator';

export class IdentityBaseDto {
  @Expose()
  @Transform(({ obj }) => obj.identity.id, { toClassOnly: true })
  id: string;

  @Expose()
  @Transform(({ obj }) => obj.identity.email, { toClassOnly: true })
  email: string;

  @Expose()
  @Transform(({ obj }) => obj.identity.firstName, { toClassOnly: true })
  firstName: string;

  @Expose()
  @Transform(({ obj }) => obj.identity.lastName, { toClassOnly: true })
  lastName: string;

  @Expose()
  @Transform(({ obj }) => obj.identity.phone, { toClassOnly: true })
  phone: string;

  @Expose()
  @DateFormat()
  createdAt: Date;

  @Expose()
  @DateFormat()
  updatedAt: Date;

  @Exclude()
  identity: any;

  @Exclude()
  sno: number;
}
