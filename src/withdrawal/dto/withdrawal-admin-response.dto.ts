import { Exclude, Expose, Transform, plainToInstance } from 'class-transformer';
import { Identity } from 'src/identity/entities/identity.entity';
import {
  CallBackStatus,
  ChannelName,
  GatewayName,
  NotificationStatus,
  OrderStatus,
  PaymentMadeOn,
  UserTypeForTransactionUpdates,
  WithdrawalMadeOn,
  WithdrawalOrderStatus,
} from 'src/utils/enum/enum';
import { roundOffAmount } from 'src/utils/utils';
import { TransformChannelDetails } from './withdrawal-user-response.dto';

@Exclude()
export class WithdrawalAdminResponseDto {
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
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  callbackStatus: CallBackStatus;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  notificationStatus: NotificationStatus;

  @Expose()
  @Transform(({ value }) => (value ? value.toLowerCase() : null), {
    toClassOnly: true,
  })
  withdrawalMadeVia: WithdrawalMadeOn;

  @Expose()
  gatewayName: GatewayName | null;

  @Expose()
  @Transform(({ value }) => (value ? value.toLowerCase() : null), {
    toClassOnly: true,
  })
  userRole: string;

  @Expose()
  systemProfit: number;

  @Expose()
  merchantFee: number;

  @Expose()
  merchantCharge: number;

  @Expose()
  @Transform(({ value }) => value?.firstName + ' ' + value?.lastName, {
    toClassOnly: true,
  })
  user: string;

  @Expose()
  date: string;
}

@Exclude()
export class WithdrawalDetailsAdminResDto {
  @Expose()
  id: number;

  @Expose()
  systemOrderId: string;

  @Expose()
  merchantOrderId: string;

  @Expose()
  amount: number;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  status: WithdrawalOrderStatus;

  @Expose()
  channel: ChannelName;

  @Expose()
  @TransformChannelDetails()
  userChannel: JSON;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  notificationStatus: NotificationStatus;

  @Expose()
  @Transform(
    ({ value }) => ({
      name: value?.name,
      role: value?.role,
      id: value?.id,
    }),
    { toClassOnly: true },
  )
  user: {};

  @Expose()
  @Transform(({ value }) => (value ? value.toLowerCase() : null), {
    toClassOnly: true,
  })
  withdrawalMadeOn: WithdrawalMadeOn | null;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  gatewayName: GatewayName | null;

  @Expose()
  transactionDetails: {};

  @Expose()
  @TransformBalancesAndProfit()
  balancesAndProfit: [] | null;
}

function TransformBalancesAndProfit() {
  return Transform(
    ({ value }) => {
      const mappedValues = value?.map((item) => {
        const roleMapping = {
          agent_balance: 'agent',
          merchant_balance: 'merchant',
          member_balance: 'member',
          system_profit: 'system',
          gateway_fee: 'gateway',
        };

        const role = roleMapping[item.userType] || item.userType;
        switch (item.userType) {
          case UserTypeForTransactionUpdates.MEMBER_BALANCE:
            return {
              role,
              name: item.name,
              serviceRate: item.rate,
              serviceFee: roundOffAmount(item.amount),
              balanceDeducted: roundOffAmount(item.before - item.after),
              balanceBefore: roundOffAmount(item.before),
              balanceAfter: roundOffAmount(item.after),
            };

          case UserTypeForTransactionUpdates.MERCHANT_BALANCE:
            return {
              role,
              name: item.name,
              serviceRate: item.rate,
              serviceFee: roundOffAmount(item.amount),
              balanceDeducted: roundOffAmount(item.before - item.after),
              balanceBefore: roundOffAmount(item.before),
              balanceAfter: roundOffAmount(item.after),
            };

          case UserTypeForTransactionUpdates.AGENT_BALANCE:
            return {
              role,
              name: item.name,
              serviceRate: item.rate,
              serviceFee: roundOffAmount(item.amount),
              balanceDeducted: roundOffAmount(item.before - item.after),
              balanceBefore: roundOffAmount(item.before),
              balanceAfter: roundOffAmount(item.after),
            };

          case UserTypeForTransactionUpdates.SYSTEM_PROFIT:
            return {
              role,
              profit: roundOffAmount(item.after - item.before),
              balanceBefore: roundOffAmount(item.before),
              balanceAfter: roundOffAmount(item.after),
            };

          case UserTypeForTransactionUpdates.GATEWAY_FEE:
            return {
              role,
              name: item.name,
              upstreamFee: roundOffAmount(item.amount),
              upstreamRate: item.rate,
            };

          default:
            return;
        }
      });

      const filteredValues = mappedValues?.filter(Boolean);
      const systemProfitEntry = filteredValues?.find(
        (entry) => entry.role === 'system',
      );
      const merchantEntry = filteredValues?.find(
        (entry) => entry.role === 'merchant',
      );
      const gatewayEntry = filteredValues?.find(
        (entry) => entry.role === 'gateway',
      );
      const otherEntries = filteredValues?.filter(
        (entry) =>
          entry.role !== 'system' &&
          entry.role !== 'merchant' &&
          entry.role !== 'gateway',
      );

      return [
        merchantEntry,
        ...otherEntries?.reverse(),
        gatewayEntry,
        systemProfitEntry,
      ]?.filter(Boolean);
    },
    { toClassOnly: true },
  );
}
