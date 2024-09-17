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
  @ManyToOne(() => Gateway, (gateway) => gateway.defaultPayinGateway)
  @JoinColumn({ name: 'default_payin_gateway_id' })
  defaultPayinGateway: Gateway;

  @ManyToOne(() => Gateway, (gateway) => gateway.defaultPayoutGateway)
  @JoinColumn({ name: 'default_payout_gateway_id' })
  defaultPayoutGateway: Gateway;

  @ManyToOne(() => Gateway, (gateway) => gateway.defaultWithdrawalGateway)
  @JoinColumn({ name: 'default_withdrawal_gateway_id' })
  defaultWithdrawalGateway: Gateway;

  @Column()
  payinTimeout: number;

  @Column()
  payoutTimeout: number;

  @Column()
  currency: string;

  // Topup Configurations
  @Column()
  topupThreshold: string;

  @Column({ type: 'float' })
  topupAmount: number;

  @OneToMany(
    () => ChannelProfileFilledField,
    (field) => field.defaultTopupChannels,
  )
  defaultTopupChannels: ChannelProfileFilledField[];

  // Member Defaults
  @Column({ type: 'float' })
  payinCommissionRateForMember: number;

  @Column({ type: 'float' })
  payoutCommissionRateForMember: number;

  @Column({ type: 'float' })
  topupCommissionRateForMember: number;

  @Column()
  minimumPayoutAmountForMember: number;

  @Column()
  maximumPayoutAmountForMember: number;

  @Column()
  maximumDailyPayoutAmountForMember: number;

  // Merchant Defaults
  @Column({ type: 'float' })
  payinServiceRateForMerchant: number;

  @Column({ type: 'float' })
  payoutServiceRateForMerchant: number;

  @Column()
  minimumPayoutAmountForMerchant: number;

  @Column()
  maximumPayoutAmountForMerchant: number;

  @Column({ type: 'float' })
  withdrawalServiceRateForMerchant: number;

  @Column()
  minimumWithdrawalAmountForMerchant: number;

  @Column()
  maximumWithdrawalAmountForMerchant: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
