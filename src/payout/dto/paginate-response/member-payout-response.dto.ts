import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class MemberAllPayoutResponseDto {
  @Expose()
  id: number;

  @Expose()
  systemOrderId: string;

  @Expose()
  amount: string;

  @Expose()
  @Transform(({ value }) => value.toLowerCase())
  status: string;

  @Expose()
  channel: string;

  @Expose()
  @Transform(
    ({ value }) => ({
      name: value.name,
      email: value.email,
      mobile: value.mobile,
    }),
    { toClassOnly: true },
  )
  user: string;

  @Expose()
  commission: number;

  @Expose()
  quotaCredit: number;
}
