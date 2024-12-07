import { Identity } from 'src/users/identity/entities/identity.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

interface CommissionInfo {
  payin: { number: number; totalAmount: number };
  payout: { number: number; totalAmount: number };
}

@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  sno: number;

  @OneToOne(() => Identity, (identity) => identity.member)
  @JoinColumn({ name: 'identity' })
  identity: Identity;

  @Column({ nullable: true, default: null })
  agent: string;

  @Column({ nullable: true, default: null })
  teamId: string;

  @Column({ type: 'json', nullable: true, default: null })
  agentCommissionRates: any;

  @Column()
  payinCommissionRate: number;

  @Column()
  payoutCommissionRate: number;

  @Column()
  singlePayoutUpperLimit: number;

  @Column()
  singlePayoutLowerLimit: number;

  @Column()
  dailyTotalPayoutLimit: number;

  @Column({ nullable: true, default: null })
  telegramId: string;

  // quota balance + commission balance
  @Column({ type: 'float', default: 0 })
  quota: number;

  // commissions
  @Column({ type: 'float', default: 0 })
  balance: number;

  @Column({ type: 'json', default: null })
  quotaCommissions: CommissionInfo;

  @Column({ type: 'json', default: null })
  agentCommissions: CommissionInfo;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ default: false })
  selfRegistered: boolean;

  // Referred any other member
  //   @OneToMany(() => MemberReferral, (referral) => referral.member)
  //   referredMember: MemberReferral[];

  // Used referral code of anther member
  //   @OneToOne(() => MemberReferral, (referral) => referral.referredMember)
  //   memberReferral: MemberReferral;

  //   @OneToMany(() => Payin, (payin) => payin.member)
  //   payin: Payin[];

  //   @OneToMany(() => Payout, (payout) => payout.member)
  //   payout: Payout[];

  //   @OneToMany(() => Topup, (topup) => topup.member)
  //   topup: Topup[];
}
