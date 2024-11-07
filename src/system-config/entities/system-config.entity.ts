import { GatewayName } from 'src/utils/enum/enum';
import {
  BeforeInsert,
  BeforeUpdate,
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

  @Column({ nullable: true, default: GatewayName.RAZORPAY })
  defaultPayinGateway: GatewayName;

  @Column({ nullable: true, default: GatewayName.RAZORPAY })
  defaultWithdrawalGateway: GatewayName;

  @Column({ nullable: true, default: GatewayName.RAZORPAY })
  defaultPayoutGateway: GatewayName;

  // Topup Configurations
  @Column({ nullable: true })
  topupThreshold: number;

  @Column({ type: 'float', nullable: true })
  topupAmount: number;

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
  @Column({ type: 'float', nullable: true })
  payinServiceRateForMerchant: number;

  @Column({ type: 'float', nullable: true })
  payoutServiceRateForMerchant: number;

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

  @BeforeInsert()
  @BeforeUpdate()
  truncateAmounts() {
    if (this.systemProfit)
      this.systemProfit = Math.trunc(this.systemProfit * 100) / 100;
  }
}
