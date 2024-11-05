import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class AdminAllTopupResponseDto {
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
  @Transform(({ value }) => (value ? value.name : null), { toClassOnly: true })
  user: string;

  @Expose()
  @Transform(
    ({ value }) => (value ? `${value.firstName} ${value.lastName}` : null),
    { toClassOnly: true },
  )
  member: string;

  @Expose()
  systemProfit: number;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase())
  callbackStatus: string;

  @Expose()
  transactionId: string;
}
