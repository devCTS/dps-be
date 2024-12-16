import { Exclude, Expose, Transform } from 'class-transformer';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { getServicerRateForMerchant, roundOffAmount } from 'src/utils/utils';
@Exclude()
export class AdminPayoutDetailsResponseDto {
  @Expose()
  id: number;

  @Expose()
  systemOrderId: string;

  @Expose()
  amount: number;

  @Expose()
  @Transform(({ value }) => (value ? value.toLowerCase() : null), {
    toClassOnly: true,
  })
  status: string;

  @Expose()
  channel: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Transform(({ value }) => (value ? value.toLowerCase() : null), {
    toClassOnly: true,
  })
  notificationStatus: string;

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
    {
      toClassOnly: true,
    },
  )
  merchant: {};

  @Expose()
  @Transform(({ value }) => (value ? value.toLowerCase() : null), {
    toClassOnly: true,
  })
  payoutMadeVia: string;

  @Expose()
  @Transform(
    ({ value }) => ({
      id: value?.id,
      name: value?.firstName + ' ' + value?.lastName,
    }),
    {
      toClassOnly: true,
    },
  )
  member: {};

  @Expose()
  gatewayName: string;

  @Expose()
  @TransformTransactionDetails()
  transactionDetails: {};

  @Expose()
  @TransformBalancesAndProfit()
  balancesAndProfit: {};

  @Expose()
  channelDetails: string;
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
              serviceRate: getServicerRateForMerchant(
                item?.absoluteAmount,
                item?.rate,
              ),
              serviceFee: roundOffAmount(item.amount),
              balanceDeducted: roundOffAmount(item.before - item.after, true),
              balanceBefore: roundOffAmount(item.before),
              balanceAfter: roundOffAmount(item.after),
            };

          case UserTypeForTransactionUpdates.AGENT_BALANCE:
            return {
              role: 'agent',
              name: item.name,
              commissionRate: item.rate,
              commissionAmount: roundOffAmount(item.amount),
              balanceEarned: roundOffAmount(item.after - item.before, true),
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
                  quotaEarned: roundOffAmount(item.after - item.before, true),
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

function TransformTransactionDetails() {
  return Transform(
    ({ value }) => {
      return {
        transactionId: value.transactionId,
        receipt: value.receipt,
        gateway: value.gateway,
        member: value.member,
        recipient: value.recipient,
      };
    },
    { toClassOnly: true },
  );
}
