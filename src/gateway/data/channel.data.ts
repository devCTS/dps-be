import { ChannelName, GatewayName, PaymentType } from 'src/utils/enum/enum';
import { CreateChannelSettingsDto } from '../dto/create-channel-settings.dto';

export const loadChannelData = (): CreateChannelSettingsDto[] => {
  return [
    {
      gatewayName: GatewayName.RAZORPAY,
      type: PaymentType.INCOMING,
      channelName: ChannelName.UPI,
      enabled: true,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.RAZORPAY,
      type: PaymentType.INCOMING,
      channelName: ChannelName.BANKING,
      enabled: true,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.RAZORPAY,
      type: PaymentType.INCOMING,
      channelName: ChannelName.E_WALLET,
      enabled: true,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.RAZORPAY,
      type: PaymentType.OUTGOING,
      channelName: ChannelName.UPI,
      enabled: false,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.RAZORPAY,
      type: PaymentType.OUTGOING,
      channelName: ChannelName.BANKING,
      enabled: false,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.RAZORPAY,
      type: PaymentType.OUTGOING,
      channelName: ChannelName.E_WALLET,
      enabled: false,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.PHONEPE,
      type: PaymentType.INCOMING,
      channelName: ChannelName.UPI,
      enabled: true,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.PHONEPE,
      type: PaymentType.INCOMING,
      channelName: ChannelName.BANKING,
      enabled: true,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.PHONEPE,
      type: PaymentType.INCOMING,
      channelName: ChannelName.E_WALLET,
      enabled: true,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.PHONEPE,
      type: PaymentType.OUTGOING,
      channelName: ChannelName.UPI,
      enabled: false,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.PHONEPE,
      type: PaymentType.OUTGOING,
      channelName: ChannelName.BANKING,
      enabled: false,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.PHONEPE,
      type: PaymentType.OUTGOING,
      channelName: ChannelName.E_WALLET,
      enabled: false,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.UNIQPAY,
      type: PaymentType.INCOMING,
      channelName: ChannelName.UPI,
      enabled: false,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.UNIQPAY,
      type: PaymentType.INCOMING,
      channelName: ChannelName.BANKING,
      enabled: false,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.UNIQPAY,
      type: PaymentType.INCOMING,
      channelName: ChannelName.E_WALLET,
      enabled: false,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.UNIQPAY,
      type: PaymentType.OUTGOING,
      channelName: ChannelName.UPI,
      enabled: true,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.UNIQPAY,
      type: PaymentType.OUTGOING,
      channelName: ChannelName.BANKING,
      enabled: true,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.UNIQPAY,
      type: PaymentType.OUTGOING,
      channelName: ChannelName.E_WALLET,
      enabled: true,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.PAYU,
      type: PaymentType.INCOMING,
      channelName: ChannelName.UPI,
      enabled: true,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.PAYU,
      type: PaymentType.INCOMING,
      channelName: ChannelName.BANKING,
      enabled: true,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.PAYU,
      type: PaymentType.INCOMING,
      channelName: ChannelName.E_WALLET,
      enabled: true,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.PAYU,
      type: PaymentType.OUTGOING,
      channelName: ChannelName.UPI,
      enabled: false,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.PAYU,
      type: PaymentType.OUTGOING,
      channelName: ChannelName.BANKING,
      enabled: false,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
    {
      gatewayName: GatewayName.PAYU,
      type: PaymentType.OUTGOING,
      channelName: ChannelName.E_WALLET,
      enabled: false,
      minAmount: 1.0,
      maxAmount: 5000.0,
      upstreamFee: 2.5,
    },
  ];
};
