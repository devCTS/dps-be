import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class FundRecordAdminResponseDto {
  @Expose()
  id: number;

  @Expose()
  systemOrderId: string;

  @Expose()
  orderType: string;

  @Expose()
  name: string;

  @Expose()
  amount: number;

  @Expose()
  orderAmount: number;

  @Expose()
  before: number;

  @Expose()
  after: number;

  @Expose()
  description: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Transform(({ value }) => value?.toUpperCase(), { toClassOnly: true })
  balanceType: string;

  @Expose()
  serviceFee: number;

  @Expose()
  systemProfit: number;
}
