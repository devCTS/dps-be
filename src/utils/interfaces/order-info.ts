export interface UserWithdrawalInfo {
  pending: number;
  frozen: number;
  complete: number;
  failed: number;
}

export interface MerchantPayoutInfo {
  pending: number;
  complete: number;
  failed: number;
}

export interface MerchantServiceInfo {
  payin: number;
  payout: number;
  withdrawal: number;
}
