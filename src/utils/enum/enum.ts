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
  ADMIN_ADJUSTMENT = 'admin_adjustment',
  MEMBER_adjustment = 'member_adjustment',
}

export enum UserTypeForTransactionUpdates {
  MERCHANT_BALANCE = 'merchant_balance',
  MEMBER_QUOTA = 'member_quota',
  MEMBER_BALANCE = 'member_balance',
  AGENT_BALANCE = 'agent_balance',
  SYSTEM_PROFIT = 'system_profit',
  GATEWAY_FEE = 'gateway_fee',
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

export enum AlertType {
  WITHDRAWAL_COMPLETE = 'withdrawal_complete',
  WITHDRAWAL_REJECTED = 'withdrawal_rejected',
  WITHDRAWAL_FAILED = 'withdrawal_failed',
  PAYOUT_SUCCESS = 'payout_success',
  PAYOUT_FAILED = 'payout_failed',
  USER_PAYIN_LIMIT = 'user_payin_limit',
}

export enum NotificationType {
  GRAB_PAYOUT = 'grab_payout',
  GRAB_TOPUP = 'grab_topup',
  PAYOUT_VERIFIED = 'payout_verified',
  PAYOUT_REJECTED = 'payout_rejected',
  TOPUP_VERIFIED = 'topup_verified',
  TOPUP_REJETCED = 'topup_rejected',
  PAYIN_FOR_VERIFY = 'payin_for_verify',
}

export enum Role {
  SUPER_ADMIN = 'super_admin',
  SUB_ADMIN = 'sub_admin',
  MEMBER = 'member',
  MERCHANT = 'merchant',
  SUB_MERCHANT = 'sub_merchant',
  AGENT = 'agent',
  ALL = 'all',
}

export interface ServiceRateType {
  mode: 'ABSOLUTE' | 'PERCENTAGE' | 'COMBINATION';
  absoluteAmount: number;
  percentageAmount: number;
}

export interface TreeNode {
  id: number;
  children: TreeNode[];
  name: string;
  email: string;
  isAgent: boolean;
  balance: number;
  quota: number;
  serviceRate: Rate;
  ratesOfAgent: Rate;
  memberRates: Rate;
}

interface Rate {
  payin: number;
  payout: number;
}
