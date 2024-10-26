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
  @Transform(
    ({ value }) => ({
      name: value?.name,
      mobile: value?.mobile,
      email: value?.email,
    }),
    { toClassOnly: true },
  )
  user: {};

  @Expose()
  paymentDetails: any;

  @Expose()
  transactionDetails: any;

  @Expose()
  quotaDetails: {};
}
