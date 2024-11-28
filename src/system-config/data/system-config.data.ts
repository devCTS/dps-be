import { GatewayName } from 'src/utils/enum/enum';

export const systemConfigData = () => {
  return {
    defaultPayinGateway: GatewayName.RAZORPAY,
    defaultWithdrawalGateway: GatewayName.RAZORPAY,
    defaultPayoutGateway: GatewayName.RAZORPAY,
    payinTimeout: 300,
    payoutTimeout: 600,
    currency: 'USD',
    topupThreshold: 1000,
    topupAmount: 5000,
    payinCommissionRateForMember: 2.5,
    payoutCommissionRateForMember: 1.5,
    topupCommissionRateForMember: 3.0,
    withdrawalRateForMember: 1,
    minimumPayoutAmountForMember: 100,
    maximumPayoutAmountForMember: 1000,
    minWithdrawalAmountForMember: 100,
    maxWithdrawalAmountForMember: 1000,
    maximumDailyPayoutAmountForMember: 5000,
    payinServiceRateForMerchant: 1.2,
    payoutServiceRateForMerchant: 0.8,
    minimumPayoutAmountForMerchant: 200,
    maximumPayoutAmountForMerchant: 2000,
    withdrawalRate: 0.5,
    minWithdrawalAmount: 150,
    maxWithdrawalAmount: 2500,
    frozenAmountThreshold: 2,
  };
};
