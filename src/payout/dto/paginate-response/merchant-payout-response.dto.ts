import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class MerchantAllPayoutResponseDto {
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
      name: value?.name,
      mobile: value?.mobile,
      email: value?.email,
    }),
    { toClassOnly: true },
  )
  user: {};

  @Expose()
  @Transform(({ value }) => (value ? value.toLowerCase() : null))
  payoutMadeVia: string;

  @Expose()
  gatewayName: string;

  @Expose()
  serviceFee: number;

  @Expose()
  balanceDebit: number;
}
