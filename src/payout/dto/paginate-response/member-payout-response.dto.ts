import { Exclude, Expose, Transform } from 'class-transformer';

export class MemberPayoutResponseDto {
  @Expose()
  id: number;

  @Expose()
  systemOrderId: string;

  @Expose()
  amount: string;

  @Expose()
  status: string;

  @Expose()
  channel: string;

  @Expose()
  @Transform(({ value }) => (value ? value.name : null))
  user: string;

  @Expose()
  commission: number;

  @Expose()
  quotaCredit: number;
}
