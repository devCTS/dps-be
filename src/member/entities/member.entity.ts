import { Identity } from 'src/identity/entities/identity.entity';
import { MemberReferral } from 'src/member-referral/entities/member-referral.entity';
import { Payin } from 'src/payin/entities/payin.entity';
import { Payout } from 'src/payout/entities/payout.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Identity, (identity) => identity.member)
  @JoinColumn({ name: 'identity' })
  identity: Identity;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  referralCode: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'float' })
  payinCommissionRate: number;

  @Column({ type: 'float' })
  payoutCommissionRate: number;

  @Column({ type: 'float' })
  topupCommissionRate: number;

  @Column({ type: 'integer' })
  singlePayoutUpperLimit: number;

  @Column({ type: 'integer' })
  singlePayoutLowerLimit: number;

  @Column({ type: 'integer' })
  dailyTotalPayoutLimit: number;

  @Column({ nullable: true })
  telegramId: string;

  @Column({ type: 'float' })
  withdrawalRate: number;

  @Column({ type: 'float' })
  minWithdrawalAmount: number;

  @Column({ type: 'float' })
  maxWithdrawalAmount: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Referred any other member
  @OneToMany(() => MemberReferral, (referral) => referral.member)
  referredMember: MemberReferral;

  // Used referral code of anther member
  @OneToOne(() => MemberReferral, (referral) => referral.referredMember)
  memberReferral: MemberReferral;

  @OneToMany(() => Payin, (payin) => payin.member)
  payin: Payin[];

  @OneToMany(() => Payout, (payout) => payout.member)
  payout: Payout[];

  @Column({ type: 'float', default: 0 })
  quota: number;

  @Column({ type: 'float', default: 0 })
  balance: number;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ default: 'abcd1234' })
  withdrawalPassword: string;
}
