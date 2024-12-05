import { Identity } from 'src/users/identity/entities/identity.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';

interface CommissionInfo {
  payin: { number: number; totalAmount: number };
  payout: { number: number; totalAmount: number };
}

@Entity()
export class Member {
  @OneToOne(() => Identity, (identity) => identity.member)
  @JoinColumn({ name: 'identity' })
  identity: Identity;

  @Column({ nullable: true })
  agent: string;

  @Column()
  teamId: string;

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

  @Column({ nullable: true })
  telegramId: string;

  // inclusive of commissions
  @Column({ type: 'float', default: 0 })
  quota: number;

  // commissions
  @Column({ type: 'float', default: 0 })
  balance: number;

  @Column('json')
  quotaCommissions: CommissionInfo;

  @Column('json')
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
