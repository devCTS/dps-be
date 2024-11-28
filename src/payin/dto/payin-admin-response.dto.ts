import { roundOffAmount } from './../../utils/utils';
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
  id: string;

  @Expose()
  systemOrderId: string;

  @Expose()
  merchantOrderId: string;

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
  @Transform(({ value }) => value?.name, { toClassOnly: true })
  user: string;

  @Expose()
  @Transform(({ value }) => value?.firstName + ' ' + value?.lastName, {
    toClassOnly: true,
  })
  merchant: string;

  @Expose()
  @Transform(({ value }) => (value ? value.toLowerCase() : null), {
    toClassOnly: true,
  })
  payinMadeOn: PaymentMadeOn;

  @Expose()
  @Transform(({ value }) => value?.firstName + ' ' + value?.lastName, {
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
  id: string;

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
      name: value?.firstName + ' ' + value?.lastName,
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
      name: value?.firstName + ' ' + value?.lastName,
    }),
    { toClassOnly: true },
  )
  member: {} | null;

  @Expose()
  @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
  gatewayName: GatewayName | null;

  @Expose()
  @TransformTransactionDetails()
  transactionDetails: {};

  @Expose()
  @TransformBalancesAndProfit()
  balancesAndProfit: [];
}

function TransformBalancesAndProfit() {
  return Transform(
    ({ value }) => {
      const mappedValues = value.map((item) => {
        switch (item.userType) {
          case UserTypeForTransactionUpdates.MERCHANT_BALANCE:
            return {
              role: 'merchant',
              name: item.name,
              serviceRate: item.rate,
              serviceFee: roundOffAmount(item.amount),
              balanceEarned: roundOffAmount(item.after - item.before),
              balanceBefore: roundOffAmount(item.before),
              balanceAfter: roundOffAmount(item.after),
            };

          case UserTypeForTransactionUpdates.AGENT_BALANCE:
            return {
              role: 'agent',
              name: item.name,
              commissionRate: item.rate,
              commissionAmount: roundOffAmount(item.amount),
              balanceEarned: roundOffAmount(item.after - item.before),
              balanceBefore: roundOffAmount(item.before),
              balanceAfter: roundOffAmount(item.after),
              isAgentOf: item.isAgentOf,
            };

          case UserTypeForTransactionUpdates.MEMBER_QUOTA:
            return item.isAgentMember
              ? {
                  role: 'agent',
                  name: item.name,
                  commissionRate: item.rate,
                  commissionAmount: roundOffAmount(item.amount),
                  balanceEarned: roundOffAmount(item.after - item.before, true),
                  balanceBefore: roundOffAmount(item.before),
                  balanceAfter: roundOffAmount(item.after),
                  isAgentOf: item.isAgentOf,
                  isMember: true,
                }
              : {
                  role: 'member',
                  name: item.name,
                  commissionRate: item.rate,
                  commissionAmount: roundOffAmount(item.amount),
                  quotaDeducted: roundOffAmount(item.after - item.before, true),
                  quotaBefore: roundOffAmount(item.before),
                  quotaAfter: roundOffAmount(item.after),
                };

          case UserTypeForTransactionUpdates.SYSTEM_PROFIT:
            return {
              role: 'system',
              profit: roundOffAmount(item.after - item.before),
              balanceBefore: roundOffAmount(item.before),
              balanceAfter: roundOffAmount(item.after),
            };

          case UserTypeForTransactionUpdates.GATEWAY_FEE:
            return {
              role: 'gateway',
              name: item.name,
              upstreamFee: roundOffAmount(item.amount),
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
      const memberEntry = filteredValues.find(
        (entry) => entry.role === 'member',
      );
      const memberAgents = filteredValues.filter(
        (entry) => entry.isMember && entry.role === 'agent',
      );
      const merchantAgents = filteredValues.filter(
        (entry) => entry.role === 'agent' && !entry.isMember,
      );

      const newSequence = [
        merchantEntry,
        memberEntry,
        ...merchantAgents.reverse(),
        ...memberAgents.reverse(),
        gatewayEntry,
        systemProfitEntry,
      ];

      return newSequence.filter(Boolean);
    },
    { toClassOnly: true },
  );
}

export function TransformTransactionDetails() {
  return Transform(
    ({ value }) => {
      const formatMemberChannelDetails = (member) => {
        if (member.upiId)
          return {
            'UPI ID': member.upiId,
            Mobile: member.mobile,
          };

        if (member.app)
          return {
            App: member.app,
            Mobile: member.mobile,
          };

        if (member.bankName) {
          return {
            'Bank Name': member.bankName,
            'IFSC Code': member.ifsc,
            'Account Number': member.accountNumber,
            'Beneficiary Name': member.beneficiaryName,
          };
        }
      };

      return {
        transactionId: value.transactionId,
        receipt: value.receipt,
        gateway: value.gateway,
        member: value.member ? formatMemberChannelDetails(value.member) : null,
      };
    },
    { toClassOnly: true },
  );
}
