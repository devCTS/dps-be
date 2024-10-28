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
  @Transform(({ value }) => (value ? value.name : null))
  user: {};

  @Expose()
  @Transform(({ value }) => value.toLowerCase())
  payoutMadeVia: string;

  @Expose()
  gatewayName: string;

  @Expose()
  serviceFee: number;

  @Expose()
  balanceDebit: number;
}
