import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class AdminAllPayoutResponseDto {
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
  @Transform(({ value }) => (value?.name ? value?.name : null))
  user: string;

  @Expose()
  @Transform(({ value }) => (value ? value.fisrtName : null))
  merchant: string;

  @Expose()
  payoutMadeVia: string;

  @Expose()
  @Transform(({ value }) => (value ? value.firstName : null))
  member: string;

  @Expose()
  gatewayName: string;

  @Expose()
  merchantCharge: number;

  @Expose()
  systemProfit: number;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase())
  callbackStatus: string;
}
