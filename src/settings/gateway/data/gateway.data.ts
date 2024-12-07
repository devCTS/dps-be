import { JwtService } from 'src/integrations/jwt/jwt.service';
import { Gateway } from 'src/utils/enums/gateways';

export const loadGatewayData = () => {
  return [
    {
      name: Gateway.RAZORPAY,
      incoming: false,
      outgoing: false,
      secretKeys: {
        keySecret: 'dummy_secret_key',
        keyId: 'dummy_secret_key',
      },
      upi: {
        incoming: {
          enabled: true,
          minAmount: 1,
          maxAmount: 100000,
          upstreamFee: 1,
        },
        outgoing: {
          enabled: true,
          minAmount: 1,
          maxAmount: 100000,
          upstreamFee: 1,
        },
      },
      netbanking: {
        incoming: {
          enabled: true,
          minAmount: 1,
          maxAmount: 100000,
          upstreamFee: 1,
        },
        outgoing: {
          enabled: true,
          minAmount: 1,
          maxAmount: 100000,
          upstreamFee: 1,
        },
      },
      eWallet: {
        incoming: {
          enabled: true,
          minAmount: 1,
          maxAmount: 100000,
          upstreamFee: 1,
        },
        outgoing: {
          enabled: true,
          minAmount: 1,
          maxAmount: 100000,
          upstreamFee: 1,
        },
      },
    },
    {
      name: Gateway.PHONEPE,
      incoming: false,
      outgoing: false,
      secretKeys: {
        merchantId: 'dummy_secret_key',
        saltKey: 'dummy_secret_key',
        saltIndex: 'dummy_secret_key',
      },
      upi: {
        incoming: {
          enabled: true,
          minAmount: 1,
          maxAmount: 100000,
          upstreamFee: 1,
        },
        outgoing: {
          enabled: true,
          minAmount: 1,
          maxAmount: 100000,
          upstreamFee: 1,
        },
      },
      netbanking: {
        incoming: {
          enabled: true,
          minAmount: 1,
          maxAmount: 100000,
          upstreamFee: 1,
        },
        outgoing: {
          enabled: true,
          minAmount: 1,
          maxAmount: 100000,
          upstreamFee: 1,
        },
      },
      eWallet: {
        incoming: {
          enabled: true,
          minAmount: 1,
          maxAmount: 100000,
          upstreamFee: 1,
        },
        outgoing: {
          enabled: true,
          minAmount: 1,
          maxAmount: 100000,
          upstreamFee: 1,
        },
      },
    },
  ];
};
