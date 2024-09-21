import { Exclude, Expose, Transform } from 'class-transformer';

function TransformChannelProfileFields() {
  return Transform(
    ({ obj }) => {
      if (!obj.defaultTopupChannels) {
        return [];
      }

      return obj.defaultTopupChannels.reduce((acc, item) => {
        if (!item?.field || !item?.field?.channel) {
          return acc;
        }

        const channel = item.field.channel;
        const field = {
          label: item.field.label,
          fieldId: item.field.id,
          value: item.fieldValue,
        };

        // Check if the channel already exists in the accumulator
        let channelEntry = acc.find(
          (entry) => entry.channel.tag === channel.tag,
        );

        if (!channelEntry) {
          channelEntry = {
            channel: {
              id: channel.id,
              name: channel.name,
              tag: channel.tag,
              incomingStatus: channel.incomingStatus,
              outgoingStatus: channel.outgoingStatus,
              logo: channel.logo,
              createdAt: channel.createdAt,
              updatedAt: channel.updatedAt,
            },
            fields: [],
          };
          acc.push(channelEntry);
        }

        // Add the field to the channel's fields array
        channelEntry.fields.push(field);

        return acc;
      }, []);
    },
    { toClassOnly: true },
  );
}

@Exclude()
export class SystemConfigResponseDto {
  // Gateways and Timeouts
  @Expose()
  defaultPayinGateway: number;

  @Expose()
  defaultPayoutGateway: number;

  @Expose()
  defaultWithdrawalGateway: number;

  @Expose()
  payinTimeout: number;

  @Expose()
  payoutTimeout: number;

  @Expose()
  currency: string;

  // Topup Configurations
  @Expose()
  topupThreshold: string;

  @Expose()
  topupAmount: number;

  @Expose()
  @TransformChannelProfileFields()
  defaultTopupChannels: {
    channelName: string;
    fields: { label: string; value: string }[];
  };

  // Member Defaults
  @Expose()
  payinCommissionRateForMember: number;

  @Expose()
  payoutCommissionRateForMember: number;

  @Expose()
  topupCommissionRateForMember: number;

  @Expose()
  minimumPayoutAmountForMember: number;

  @Expose()
  maximumPayoutAmountForMember: number;

  @Expose()
  maximumDailyPayoutAmountForMember: number;

  // Merchant Defaults
  @Expose()
  payinServiceRateForMerchant: number;

  @Expose()
  payoutServiceRateForMerchant: number;

  @Expose()
  minimumPayoutAmountForMerchant: number;

  @Expose()
  maximumPayoutAmountForMerchant: number;

  @Expose()
  withdrawalServiceRateForMerchant: number;

  @Expose()
  minimumWithdrawalAmountForMerchant: number;

  @Expose()
  maximumWithdrawalAmountForMerchant: number;
}
