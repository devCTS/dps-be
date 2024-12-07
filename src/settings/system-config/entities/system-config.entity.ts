import { Channels } from 'src/utils/enums/channels';
import { ChannelProfile } from 'src/utils/interfaces/channel-profile';
import { FeeModeDetails } from 'src/utils/interfaces/fee-mode';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

interface GatewayPriorityChain {
  phonepe: number;
  razorpay: number;
}

interface TopupChannel {
  sno: number;
  channel: Channels;
  channelProfile: ChannelProfile;
}

@Entity()
export class SystemConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 20000 })
  payinTimeout: number;

  @Column({ default: 20000 })
  payoutTimeout: number;

  @Column({ type: 'json', nullable: true, default: null })
  defaultPayinGateway: GatewayPriorityChain;

  @Column({ type: 'json', nullable: true, default: null })
  defaultWithdrawalGateway: GatewayPriorityChain;

  @Column({ type: 'json', nullable: true, default: null })
  defaultPayoutGateway: GatewayPriorityChain;

  // Topup Configurations
  @Column({ default: 6000 })
  topupThreshold: number;

  @Column({ default: 200 })
  topupAmount: number;

  @Column({ type: 'json', default: [] })
  topupChannels: TopupChannel[];

  // Member Defaults
  @Column({ type: 'float', nullable: true })
  payinCommissionRateForMember: number;

  @Column({ type: 'float', nullable: true })
  payoutCommissionRateForMember: number;

  @Column({ type: 'float', nullable: true })
  topupCommissionRateForMember: number;

  @Column({ nullable: true })
  minimumPayoutAmountForMember: number;

  @Column({ nullable: true })
  maximumPayoutAmountForMember: number;

  @Column({ nullable: true })
  maximumDailyPayoutAmountForMember: number;

  // Merchant Defaults
  @Column({ type: 'json', nullable: true })
  payinServiceRateForMerchant: FeeModeDetails;

  @Column({ type: 'json', nullable: true })
  payoutServiceRateForMerchant: FeeModeDetails;

  @Column({ default: 10 })
  minimumPayoutAmountForMerchant: number;

  @Column({ default: 5000 })
  maximumPayoutAmountForMerchant: number;

  // Withdrawal defaults
  @Column({ default: 1 })
  withdrawalRate: number;

  @Column({ default: 10 })
  minWithdrawalAmount: number;

  @Column({ default: 5000 })
  maxWithdrawalAmount: number;

  @Column({ default: 0 })
  systemProfit: number;

  @Column({ default: 100000 })
  endUserPayinLimit: number;

  @Column({ default: 7 })
  frozenAmountThreshold: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
