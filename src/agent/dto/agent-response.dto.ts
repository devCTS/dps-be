import { Exclude, Expose, Transform } from 'class-transformer';
import { Identity } from 'src/identity/entities/identity.entity';
import { DateFormat } from 'src/utils/decorators/dateformat.decorator';

@Exclude()
export class AgentResponseDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  @Transform(({ obj }) => obj.identity.email, { toClassOnly: true })
  email: string;

  @Expose()
  @Transform(({ obj }) => obj.phone ?? null, { toClassOnly: true }) // Handle optional field
  phone: string | null;

  @Expose()
  referralCode: string;

  @Expose()
  enabled: boolean;

  @Expose()
  @DateFormat()
  createdAt: Date;

  @Expose()
  @DateFormat()
  updatedAt: Date;

  @Exclude()
  identity: Identity;
}
