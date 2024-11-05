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
  updatedAt: Date;

  @Expose()
  @Transform(
    ({ value }) =>
      value ? `${value.firstName} ${value.lastName}` : 'member not assigned',
    { toClassOnly: true },
  )
  member: string;

  @Expose()
  transactionId: string;

  @Expose()
  memberCommission: number;

  @Expose()
  totalAgentCommission: number;
}
