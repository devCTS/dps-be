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
} from 'src/utils/enum/enum';

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
  status: OrderStatus;

  @Expose()
  channel: ChannelName;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  callbackStatus: CallBackStatus;

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
  @Transform(
    ({ value }) => ({
      id: value?.id,
      name: value?.firstName + value?.lastName,
    }),
    { toClassOnly: true },
  )
  merchant: {};

  @Expose()
  @Transform(({ value }) => (value ? value.toLowerCase() : null), {
    toClassOnly: true,
  })
  payinMadeOn: PaymentMadeOn | null;

  @Expose()
  @Transform(
    ({ value }) => ({
      id: value?.id,
      name: value?.firstName + value?.lastName,
    }),
    { toClassOnly: true },
  )
  member: {} | null;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  gatewayName: GatewayName | null;

  @Expose()
  transactionDetails: {};

  @Expose()
  @TransformBalancesAndProfit()
  balancesAndProfit: [];
}

function TransformBalancesAndProfit() {
  return Transform(
    ({ value }) => {
      const mappedValues = value.map((item) => {
        const roleMapping = {
          agent_balance: 'agent',
          merchant_balance: 'merchant',
          member_balance: 'agent',
          system_profit: 'system',
          member_quota: 'member',
          gateway_fee: 'gateway',
        };

        const role = roleMapping[item.userType] || item.userType;

        switch (item.userType) {
          case UserTypeForTransactionUpdates.MERCHANT_BALANCE:
            return {
              role,
              name: item.name,
              serviceRate: item.rate,
              serviceFee: item.amount,
              balanceEarned: item.after - item.before,
              balanceBefore: item.before,
              balanceAfter: item.after,
            };

          case UserTypeForTransactionUpdates.AGENT_BALANCE:
            return {
              role,
              name: item.name,
              commissionRate: item.rate,
              commissionAmount: item.amount,
              balanceEarned: item.after - item.before,
              balanceBefore: item.before,
              balanceAfter: item.after,
              isAgentOf: item.isAgentOf,
            };

          case UserTypeForTransactionUpdates.MEMBER_QUOTA:
            return {
              role,
              name: item.name,
              commissionRate: item.rate,
              commissionAmount: item.amount,
              quotaDeducted: item.after - item.before, // verify
              quotaBefore: item.before,
              quotaAfter: item.after,
            };

          case UserTypeForTransactionUpdates.MEMBER_BALANCE:
            return {
              role,
              name: item.name,
              commissionRate: item.rate,
              commissionAmount: item.amount,
              balanceEarned: item.after - item.before,
              balanceBefore: item.before,
              balanceAfter: item.after,
              isAgentOf: item.isAgentOf,
              isMember: true,
            };

          case UserTypeForTransactionUpdates.SYSTEM_PROFIT:
            return {
              role,
              profit: item.after - item.before,
              balanceBefore: item.before,
              balanceAfter: item.after,
            };

          case UserTypeForTransactionUpdates.GATEWAY_FEE:
            return {
              role,
              name: item.name,
              upstreamFee: item.amount,
              upstreamRate: item.rate,
            };

          default:
            return;
        }
      });

      const filteredValues = mappedValues.filter(Boolean);
      const systemProfitEntry = filteredValues.find(
        (entry) => entry.role === 'system',
      );
      const merchantEntry = filteredValues.find(
        (entry) => entry.role === 'merchant',
      );
      const gatewayEntry = filteredValues.find(
        (entry) => entry.role === 'gateway',
      );
      const otherEntries = filteredValues.filter(
        (entry) =>
          entry.role !== 'system' &&
          entry.role !== 'merchant' &&
          entry.role !== 'gateway',
      );

      return [
        merchantEntry,
        ...otherEntries.reverse(),
        gatewayEntry,
        systemProfitEntry,
      ].filter(Boolean);
    },
    { toClassOnly: true },
  );
}
