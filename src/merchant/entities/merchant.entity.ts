import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { PayinMode } from './payinMode.entity';
import { Submerchant } from 'src/sub-merchant/entities/sub-merchant.entity';
import { Identity } from 'src/identity/entities/identity.entity';
import { AgentReferral } from 'src/agent-referral/entities/agent-referral.entity';
import { Payout } from 'src/payout/entities/payout.entity';
import { Payin } from 'src/payin/entities/payin.entity';
import { EndUser } from 'src/end-user/entities/end-user.entity';

@Entity()
export class Merchant {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Identity, (identity) => identity.merchant)
  @JoinColumn({ name: 'identity' })
  identity: Identity;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  businessName: string;

  @Column({ nullable: true })
  referralCode: string;

  @Column({ default: true })
  enabled: boolean;

  @Column()
  withdrawalPassword: string;

  @Column({ unique: true })
  integrationId: string;

  @Column()
  businessUrl: string;

  @Column({ default: false })
  allowMemberChannelsPayin: boolean;

  @Column({ default: false })
  allowPgBackupForPayin: boolean;

  @Column({ default: false })
  allowMemberChannelsPayout: boolean;

  @Column({ default: false })
  allowPgBackupForPayout: boolean;

  @Column('float')
  payinServiceRate: number;

  @Column('float')
  payoutServiceRate: number;

  @Column('float')
  withdrawalServiceRate: number;

  @Column()
  minPayout: number;

  @Column()
  maxPayout: number;

  @Column()
  minWithdrawal: number;

  @Column()
  maxWithdrawal: number;

  @Column({
    enum: ['DEFAULT', 'PROPORTIONAL', 'AMOUNT RANGE'],
    default: 'DEFAULT',
  })
  payinMode: 'DEFAULT' | 'PROPORTIONAL' | 'AMOUNT RANGE';

  @CreateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  updatedAt: Date;

  @OneToOne(() => PayinMode, (payinMode) => payinMode.merchant)
  payinModeDetails: PayinMode[];

  @OneToMany(() => Submerchant, (submerchant) => submerchant.merchant)
  submerchants: Submerchant[];

  @OneToOne(() => AgentReferral, (referral) => referral.referredMerchant)
  agentReferral: AgentReferral;

  @OneToMany(() => Payin, (payin) => payin.merchant)
  payin: Payin[];

  @OneToMany(() => Payout, (payout) => payout.merchant)
  payout: Payout[];

  @OneToMany(() => EndUser, (endUser) => endUser.merchant)
  endUser: Payout[];

  @Column({ type: 'float', default: 0 })
  balance: number;

  @Column()
  payinChannels: string;

  @Column()
  payoutChannels: string;

  @Column({ default: false })
  isOnline: boolean;
}
