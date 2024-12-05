import { Identity } from 'src/users/identity/entities/identity.entity';
import { SubMerchant } from 'src/users/sub-merchant/entities/sub-merchant.entity';
import { Channels } from 'src/utils/enums/channels';
import { Gateway } from 'src/utils/enums/gateways';
import { PayinMode } from 'src/utils/enums/misc';
import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

interface FeeModeDetails {
  mode: 'ABSOLUTE' | 'PERCENTAGE' | 'COMBINATION';
  absoluteAmount: number;
  percentageAmount: number;
}

interface Range {
  lower: number;
  upper: number;
  gateway: Gateway;
}

interface Ratio {
  ratio: number;
  gateway: Gateway;
}

interface PayinModeDetails {
  type: PayinMode;
  entries: number;
  ranges: Range[];
  ratios: Ratio[];
}

interface ChannelProfile {
  upi: {
    upiId: string;
    mobile: string;
    isBusinessUpi: boolean;
  };
  netbanking: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
    beneficiaryName: string;
  };
  eWallet: { app: string; mobile: string };
}

interface UserWithdrawalInfo {
  pending: number;
  frozen: number;
  complete: number;
  failed: number;
}

interface MerchantPayoutInfo {
  pending: number;
  complete: number;
  failed: number;
}

interface MerchantServiceInfo {
  payin: number;
  payout: number;
  withdrawal: number;
}

@Entity()
export class Merchant {
  @OneToOne(() => Identity, (identity) => identity.merchant)
  @JoinColumn({ name: 'identity' })
  identity: Identity;

  @Column({ type: 'float', default: 0 })
  balance: number;

  @Column({ unique: true })
  integrationId: string;

  @Column()
  businessUrl: string;

  @Column()
  businessName: string;

  @Column()
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

  @Column('json')
  channelProfile: ChannelProfile;

  @Column('json')
  withdrawalInfo: UserWithdrawalInfo;

  @Column('json')
  payoutInfo: MerchantPayoutInfo;

  @Column('json')
  serviceInfo: MerchantServiceInfo;

  @Column('float')
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
