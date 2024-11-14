import { Withdrawal } from './../../withdrawal/entities/withdrawal.entity';
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

export enum WithdrawalOrderStatus {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  COMPLETE = 'COMPLETE',
  REJECTED = 'REJECTED',
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

export enum WithdrawalMadeOn {
  ADMIN = 'ADMIN',
  GATEWAY = 'GATEWAY',
}

export enum OrderType {
  PAYIN = 'Payin',
  PAYOUT = 'Payout',
  TOPUP = 'Topup',
  WITHDRAWAL = 'Withdrawal',
}

export enum UserTypeForTransactionUpdates {
  MERCHANT_BALANCE = 'merchant_balance',
  MEMBER_QUOTA = 'member_quota',
  MEMBER_BALANCE = 'member_balance',
  AGENT_BALANCE = 'agent_balance',
  SYSTEM_PROFIT = 'system_profit',
  GATEWAY_FEE = 'gateway_fee',
  ADMIN_SETTLEMENT = 'admin_settlement',
  MEMBER_SETTLEMENT = 'member_settlement',
}

export enum Users {
  MERCHANT = 'Merchant',
  AGENT = 'Agent',
  MEMBER = 'Member',
  ADMIN = 'Admin',
}

export enum NotificationReadStatus {
  READ = 'READ',
  UNREAD = 'UNREAD',
}

export enum AlertReadStatus {
  READ = 'READ',
  UNREAD = 'UNREAD',
}
