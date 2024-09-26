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
import { Gateway } from 'src/gateway/entities/gateway.entity';
import { ChannelProfileFilledField } from 'src/channel/entities/channelProfileFilledField.entity';

@Entity()
export class SystemConfig {
  @PrimaryGeneratedColumn()
  id: number;

  // Gateways and Timeouts
  @ManyToOne(() => Gateway, (gateway) => gateway.defaultPayinGateway, {
    nullable: true,
  })
  @JoinColumn({ name: 'default_payin_gateway_id' })
  defaultPayinGateway: Gateway;

  @ManyToOne(() => Gateway, (gateway) => gateway.defaultPayoutGateway, {
    nullable: true,
  })
  @JoinColumn({ name: 'default_payout_gateway_id' })
  defaultPayoutGateway: Gateway;

  @ManyToOne(() => Gateway, (gateway) => gateway.defaultWithdrawalGateway, {
    nullable: true,
  })
  @JoinColumn({ name: 'default_withdrawal_gateway_id' })
  defaultWithdrawalGateway: Gateway;

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

  @OneToMany(
    () => ChannelProfileFilledField,
    (field) => field.defaultTopupChannels,
    { nullable: true },
  )
  defaultTopupChannels: ChannelProfileFilledField[];

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
}
