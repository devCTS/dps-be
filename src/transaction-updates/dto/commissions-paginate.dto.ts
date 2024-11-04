import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CommissionsAdminPaginateResponseDto {
  @Expose()
  id: number;

  @Expose()
  orderId: number;

  @Expose()
  orderType: number;

  @Expose()
  agentMember: string;

  @Expose()
  merchant: string;

  @Expose()
  orderAmount: number;

  @Expose()
  merchantFees: number;

  @Expose()
  commission: number;

  @Expose()
  date: string;

  @Expose()
  referralUser: string;
}
