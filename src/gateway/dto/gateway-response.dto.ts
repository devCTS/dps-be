import { Expose } from 'class-transformer';
import { Transform } from 'class-transformer';

function TransformGatewayToChannel() {
  return Transform(
    ({ obj }) => {
      if (!obj.gatewayToChannel) {
        return [];
      }

      return obj.gatewayToChannel.map((gatewayChannel) => {
        const channel = gatewayChannel.channel;

        // Exclude the specified fields from the channel object
        const {
          profileFields,
          createdAt: channelCreatedAt,
          updatedAt: channelUpdatedAt,
          ...restChannel
        } = channel;

        // Exclude createdAt and updatedAt from gatewayChannel
        const {
          createdAt: gatewayCreatedAt,
          updatedAt: gatewayUpdatedAt,
          ...restGatewayChannel
        } = gatewayChannel;

        return {
          ...restGatewayChannel,
          channel: restChannel,
        };
      });
    },
    { toClassOnly: true },
  );
}

function TransformMerchantKeys() {
  return Transform(
    ({ value }) => {
      if (!value) {
        return [];
      }

      return value.map((key) => {
        const {
          createdAt: keyCreatedAt,
          updatedAt: keyUpdatedAt,
          ...restKey
        } = key;

        return restKey;
      });
    },
    { toClassOnly: true },
  );
}

export class GatewayResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  logo: string;

  @Expose()
  incomingStatus: boolean;

  @Expose()
  outgoingStatus: boolean;

  @Expose()
  @TransformGatewayToChannel()
  gatewayToChannel: {}[];

  @Expose()
  @TransformMerchantKeys()
  uatMerchantKeys: {
    label: string;
    value: string;
  }[];

  @Expose()
  @TransformMerchantKeys()
  prodMerchantKeys: {
    label: string;
    value: string;
  }[];
}
