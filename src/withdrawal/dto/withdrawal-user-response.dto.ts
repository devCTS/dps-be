import { Exclude, Expose, Transform } from 'class-transformer';
import {
  ChannelName,
  GatewayName,
  NotificationStatus,
  UserTypeForTransactionUpdates,
  WithdrawalMadeOn,
  WithdrawalOrderStatus,
} from 'src/utils/enum/enum';

@Exclude()
export class WithdrawalUserResponseDto {
  @Expose()
  id: number;

  @Expose()
  systemOrderId: string;

  @Expose()
  amount: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  status: string;

  @Expose()
  channel: ChannelName;

  @Expose()
  serviceCharge: number;

  @Expose()
  balanceAfter: number;

  @Expose()
  balanceBefore: number;

  @Expose()
  date: string;
}

@Exclude()
export class WithdrawalDetailsUserResDto {
  @Expose()
  id: number;

  @Expose()
  systemOrderId: string;

  @Expose()
  amount: number;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  status: WithdrawalOrderStatus;

  @Expose()
  channel: ChannelName;

  @Expose()
  userChannel: JSON;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Transform(({ value }) => (value ? value.toLowerCase() : null), {
    toClassOnly: true,
  })
  withdrawalMadeOn: WithdrawalMadeOn | null;

  @Expose()
  transactionDetails: {};

  @Expose()
  serviceCharge: number;

  @Expose()
  balanceDeducted: number;
}
