import { Exclude, Expose, Transform } from 'class-transformer';

export class MerchantPayoutResponseDto {
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
  payoutModeVia: string;

  @Expose()
  gatewayName: string;

  @Expose()
  serviceFee: number;

  @Expose()
  balanceDebit: number;
}
