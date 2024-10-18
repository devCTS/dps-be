import { Exclude, Expose, Transform } from 'class-transformer';
import {
  CallBackStatus,
  ChannelName,
  GatewayName,
  OrderStatus,
  PaymentMadeOn,
  UserTypeForTransactionUpdates,
} from 'src/utils/enum/enum';
import { CreateDateColumn } from 'typeorm';

@Exclude()
export class PayinAdminResponseDto {
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
  status: string;

  @Expose()
  channel: ChannelName;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  callbackStatus: CallBackStatus;

  @Expose()
  @Transform(({ value }) => value?.name, { toClassOnly: true })
  user: string;

  @Expose()
  @Transform(({ value }) => value?.firstName + value?.lastName, {
    toClassOnly: true,
  })
  merchant: string;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  payinMadeOn: PaymentMadeOn;

  @Expose()
  @Transform(({ value }) => value?.firstName + value?.lastName, {
    toClassOnly: true,
  })
  member: string | null;

  @Expose()
  gatewayName: GatewayName | null;

  @Expose()
  merchantCharge: number;

  @Expose()
  systemProfit: number;
}

@Exclude()
export class PayinDetailsAdminResDto {
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
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  payinMadeOn: PaymentMadeOn;

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
              quotaDeducted: item.after - item.before,
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
      const otherEntries = filteredValues.filter(
        (entry) => entry.role !== 'system' && entry.role !== 'merchant',
      );

      return [
        merchantEntry,
        ...otherEntries.reverse(),
        systemProfitEntry,
      ].filter(Boolean);
    },
    { toClassOnly: true },
  );
}
