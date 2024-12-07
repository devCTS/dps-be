import { Identity } from 'src/users/identity/entities/identity.entity';
import { SubMerchant } from 'src/users/sub-merchant/entities/sub-merchant.entity';
import { Channels } from 'src/utils/enums/channels';
import { Gateway } from 'src/utils/enums/gateways';
import { PayinMode } from 'src/utils/enums/misc';
import { ChannelProfile } from 'src/utils/interfaces/channel-profile';
import { FeeModeDetails } from 'src/utils/interfaces/fee-mode';
import {
  MerchantPayoutInfo,
  MerchantServiceInfo,
  UserWithdrawalInfo,
} from 'src/utils/interfaces/order-info';
import { PayinModeDetails } from 'src/utils/interfaces/payin-mode';
import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Merchant {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Identity, (identity) => identity.merchant)
  @JoinColumn({ name: 'identity' })
  identity: Identity;

  @Column({ default: 0 })
  balance: number;

  @Column({ unique: true })
  integrationId: string;

  @Column()
  businessUrl: string;

  @Column()
  businessName: string;

  @Column({ nullable: true, default: null })
  agent: string;

  @Column()
  withdrawalPassword: string;

  @Column({ default: true })
  allowMemberChannelsPayin: boolean;

  @Column({ default: true })
  allowPgBackupForPayin: boolean;

  @Column({ default: true })
  allowMemberChannelsPayout: boolean;

  @Column({ default: true })
  allowPgBackupForPayout: boolean;

  @Column('json')
  payinServiceRate: FeeModeDetails;

  @Column('json')
  payoutServiceRate: FeeModeDetails;

  @Column('json')
  withdrawalServiceRate: FeeModeDetails;

  @Column()
  minPayout: number;

  @Column()
  maxPayout: number;

  @Column()
  minWithdrawal: number;

  @Column()
  maxWithdrawal: number;

  @Column({
    type: 'text',
    array: true,
    enum: Channels,
  })
  payinChannels: Channels;

  @Column({
    type: 'text',
    array: true,
    enum: Channels,
  })
  payoutChannels: Channels;

  @Column({
    type: 'json',
  })
  payinMode: PayinModeDetails;

  @Column({ type: 'json', default: null })
  channelProfile: ChannelProfile;

  @Column({ type: 'json', default: null })
  withdrawalInfo: UserWithdrawalInfo;

  @Column({ type: 'json', default: null })
  payoutInfo: MerchantPayoutInfo;

  @Column({ type: 'json', default: null })
  serviceInfo: MerchantServiceInfo;

  @Column({ default: 0 })
  payinIncome: number;

  @OneToMany(() => SubMerchant, (submerchant) => submerchant.merchant)
  submerchants: SubMerchant[];

  //   @OneToOne(() => PayinMode, (payinMode) => payinMode.merchant)
  //   payinModeDetails: PayinMode;

  //   @OneToOne(() => AgentReferral, (referral) => referral.referredMerchant)
  //   agentReferral: AgentReferral;

  //   @OneToMany(() => Payin, (payin) => payin.merchant)
  //   payin: Payin[];

  //   @OneToMany(() => Payout, (payout) => payout.merchant)
  //   payout: Payout[];

  //   @OneToMany(() => EndUser, (endUser) => endUser.merchant)
  //   endUser: EndUser[];
}
