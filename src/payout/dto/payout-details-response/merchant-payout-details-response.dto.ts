import { Expose } from 'class-transformer';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { Member } from 'src/member/entities/member.entity';

export class MerchantPayoutDetailsResponseDto {
  @Expose()
  id: number;

  @Expose()
  systemOrderId: number;

  @Expose()
  amount: number;

  @Expose()
  status: string;

  @Expose()
  channel: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  user: EndUser;

  @Expose()
  paymentDetails: any;

  @Expose()
  transactionDetails: any;

  @Expose()
  quotaDetails: any;

  @Expose()
  notificationStatus: string;

  @Expose()
  payoutMadeVia: string;

  @Expose()
  member: Member;

  @Expose()
  gatewayName: string;

  @Expose()
  balanceDetails: any;
}