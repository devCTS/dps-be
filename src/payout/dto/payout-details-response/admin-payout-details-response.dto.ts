import { Exclude, Expose } from 'class-transformer';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { Member } from 'src/member/entities/member.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';

export class AdminPayoutDetailsResponseDto {
  @Expose()
  id: number;

  @Expose()
  systemOrderId: string;

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
  notificationStatus: string;

  @Expose()
  user: EndUser;

  @Expose()
  merchant: Merchant;

  @Expose()
  payoutMadeVia: string;

  @Expose()
  member: Member;

  @Expose()
  gatewayName: string;

  @Expose()
  transactionDetails: {};

  @Expose()
  balancesAndProfit: {};
}
