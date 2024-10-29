import { Exclude, Expose, Transform } from 'class-transformer';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { ChannelName } from 'src/utils/enum/enum';

@Exclude()
export class MemberPayoutDetailsResponseDto {
  @Expose()
  id: number;

  @Expose()
  systemOrderId: number;

  @Expose()
  amount: number;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  status: string;

  @Expose()
  channel: ChannelName;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Transform(({ value }) => {
    return value;
  })
  user: {};

  @Expose()
  paymentDetails: any;

  @Expose()
  transactionDetails: any;

  @Expose()
  @Transform(({ value }) => {
    return {
      commissionRate: value?.commissionRate,
      commissionAmount: value?.commissionAmount,
      quotaEarned: value?.quotaEarned,
    };
  })
  quotaDetails: {};
}
