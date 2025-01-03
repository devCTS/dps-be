import { ServiceRateType } from './../../utils/enum/enum';
import { GatewayName } from 'src/utils/enum/enum';

export const systemConfigData = () => {
  return {
    defaultPayinGateway: JSON.stringify({
      0: GatewayName.RAZORPAY,
      1: GatewayName.PHONEPE,
      2: GatewayName.UNIQPAY,
    }),
    defaultWithdrawalGateway: JSON.stringify({
      0: GatewayName.RAZORPAY,
      1: GatewayName.PHONEPE,
      2: GatewayName.UNIQPAY,
    }),
    defaultPayoutGateway: JSON.stringify({
      0: GatewayName.RAZORPAY,
      1: GatewayName.PHONEPE,
      2: GatewayName.UNIQPAY,
    }),
    payinTimeout: 300,
    payoutTimeout: 600,
    currency: 'USD',
    topupThreshold: 1000,
    topupAmount: 5000,
    topupServiceRate: 10,
    payinSystemProfitRate: 5,
    payoutSystemProfitRate: 5,
    payinCommissionRateForMember: 2.5,
    payoutCommissionRateForMember: 1.5,
    topupCommissionRateForMember: 3.0,
    withdrawalRateForMember: 1,
    minimumPayoutAmountForMember: 100,
    maximumPayoutAmountForMember: 1000,
    minWithdrawalAmountForMember: 100,
    maxWithdrawalAmountForMember: 1000,
    maximumDailyPayoutAmountForMember: 5000,
    payinServiceRateForMerchant: <ServiceRateType>{
      mode: 'PERCENTAGE',
      absoluteAmount: null,
      percentageAmount: 0.2,
    },
    payoutServiceRateForMerchant: <ServiceRateType>{
      mode: 'PERCENTAGE',
      absoluteAmount: null,
      percentageAmount: 0.2,
    },
    minimumPayoutAmountForMerchant: 200,
    maximumPayoutAmountForMerchant: 2000,
    withdrawalRate: 0.5,
    minWithdrawalAmount: 150,
    maxWithdrawalAmount: 2500,
    frozenAmountThreshold: 2,
    endUserPayinLimit: 1000000,
  };
};
