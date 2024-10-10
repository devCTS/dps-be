import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
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

  @Column({ type: 'float', nullable: true })
  withdrawalServiceRateForMerchant: number;

  @Column({ nullable: true })
  minimumWithdrawalAmountForMerchant: number;

  @Column({ nullable: true })
  maximumWithdrawalAmountForMerchant: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'float', nullable: true, default: 0 }) // remove nullable
  systemProfit: number;
}
