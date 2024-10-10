export enum ChannelName {
  UPI = 'UPI',
  BANKING = 'NET_BANKING',
  E_WALLET = 'E_WALLET',
}

export enum GatewayName {
  RAZORPAY = 'RAZORPAY',
  PHONEPE = 'PHONEPE',
}

export enum PaymentType {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING',
}

export enum OrderStatus {
  FAILED = 'FAILED',
  COMPLETE = 'COMPLETE',
  SUBMITTED = 'SUBMITTED',
  INITIATED = 'INITIATED',
  ASSIGNED = 'ASSIGNED',
}

export enum CallBackStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
}

export enum PaymentMadeOn {
  GATEWAY = 'GATEWAY',
  MEMBER = 'MEMBER',
}

export enum SortedBy {
  LATEST = 'latest',
  OLDEST = 'oldest',
}

export enum NotificationStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
}

export enum OrderType {
  PAYIN = 'Payin',
  PAYOUT = 'Payout',
  TOPUP = 'Topup',
  WITHDRAWAl = 'Withdrawal',
}

export enum UserTypeForTransactionUpdates {
  MERCHANT_BALANCE = 'merchant_balance',
  MEMBER_QUOTA = 'member_quota',
  MEMBER_BALANCE = 'member_balance',
  AGENT_BALANCE = 'agent_balance',
  SYSTEM_PROFIT = 'system_profit',
}
