import { Exclude, Expose, Transform } from 'class-transformer';

export class AdminPayoutResponseDto {
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
  @Transform(({ value }) => (value ? value.fisrtName : null))
  merchant: string;

  @Expose()
  payoutModeVia: string;

  @Expose()
  @Transform(({ value }) => (value ? value.firstName : null))
  member: string;

  @Expose()
  gatewayName: string;

  @Expose()
  merchantFee: number;

  @Expose()
  merchantCharge: number;

  @Expose()
  systemProfit: number;
}
