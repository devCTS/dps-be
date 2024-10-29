import { Exclude, Expose, Transform } from 'class-transformer';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { Member } from 'src/member/entities/member.entity';
import {
  ChannelName,
  GatewayName,
  OrderStatus,
  PaymentMadeOn,
} from 'src/utils/enum/enum';

@Exclude()
export class MerchantPayoutDetailsResponseDto {
  @Expose()
  id: number;

  @Expose()
  systemOrderId: number;

  @Expose()
  amount: number;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  status: OrderStatus;

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
  quotaDetails: any;

  @Expose()
  notificationStatus: string;
  @Expose()
  @Transform(({ value }) => (value ? value.toLowerCase() : null), {
    toClassOnly: true,
  })
  payoutMadeVia: PaymentMadeOn;

  @Expose()
  @Transform(
    ({ value }) => ({
      id: value?.id,
      name: value?.firstName + ' ' + value?.lastName,
    }),
    { toClassOnly: true },
  )
  merchant: {};

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  gatewayName: GatewayName | null;

  @Expose()
  balanceDetails: any;

  @Expose()
  channelDetails: string;
}
