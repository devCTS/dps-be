import { Exclude, Expose, Transform } from 'class-transformer';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { roundOffAmount } from 'src/utils/utils';
@Exclude()
export class AdminTopupDetailsResponseDto {
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
  notificationStatus: string;

  @Expose()
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
          case UserTypeForTransactionUpdates.AGENT_BALANCE:
            return {
              role: 'agent',
              name: item.name,
              commissionRate: item.rate,
              rateText: item?.rateText,
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
                  rateText: item?.rateText,
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
                  rateText: item?.rateText,
                  commissionAmount: roundOffAmount(item.amount),
                  quotaEarned: roundOffAmount(item.after - item.before, true),
                  quotaBefore: roundOffAmount(item.before),
                  quotaAfter: roundOffAmount(item.after),
                };

          default:
            return;
        }
      });
      const filteredValues = mappedValues.filter(Boolean);

      const memberEntry = filteredValues.find(
        (entry) => entry.role === 'member',
      );
      const memberAgents = filteredValues.filter(
        (entry) => entry.isMember && entry.role === 'agent',
      );

      const newSequence = [memberEntry, ...memberAgents];

      return newSequence.filter(Boolean);
    },
    { toClassOnly: true },
  );
}
