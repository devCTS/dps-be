import { ServiceRateType } from 'src/utils/enum/enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class SystemConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  payinTimeout: number;

  @Column({ nullable: true })
  payoutTimeout: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  defaultPayinGateway: string;

  @Column({ nullable: true })
  defaultWithdrawalGateway: string;

  @Column({ nullable: true })
  defaultPayoutGateway: string;

  // System Profit Defaults
  @Column({ type: 'float', nullable: true })
  payinSystemProfitRate: number;

  @Column({ type: 'float', nullable: true })
  payoutSystemProfitRate: number;

  // Topup Configurations
  @Column({ nullable: true })
  topupThreshold: number;

  @Column({ type: 'float', nullable: true })
  topupAmount: number;

  @Column({ type: 'float', nullable: true })
  topupServiceRate: number;

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
  payinServiceRateForMerchant: ServiceRateType;

  @Column({ type: 'json', nullable: true })
  payoutServiceRateForMerchant: ServiceRateType;

  @Column({ nullable: true })
  minimumPayoutAmountForMerchant: number;

  @Column({ nullable: true })
  maximumPayoutAmountForMerchant: number;

  // Withdrawal defaults
  @Column({ type: 'float', nullable: true })
  withdrawalRate: number;

  @Column({ nullable: true })
  minWithdrawalAmount: number;

  @Column({ nullable: true })
  maxWithdrawalAmount: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'float', default: 0 })
  systemProfit: number;

  @Column({ nullable: true })
  endUserPayinLimit: number;

  @Column({ default: 2 })
  frozenAmountThreshold: number;
}
