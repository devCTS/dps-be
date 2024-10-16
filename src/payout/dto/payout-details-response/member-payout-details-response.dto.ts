import { Expose } from 'class-transformer';
import { EndUser } from 'src/end-user/entities/end-user.entity';

export class MemberPayoutDetailsResponseDto {
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
}
