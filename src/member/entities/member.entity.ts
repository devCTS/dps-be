import { Identity } from 'src/identity/entities/identity.entity';
import { MemberReferral } from 'src/member-referral/entities/member-referral.entity';
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

  @ManyToOne(() => Identity, (identity) => identity.members)
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

  @Column({ type: 'integer' })
  topupCommissionRate: number;

  @Column({ type: 'integer' })
  singlePayoutUpperLimit: number;

  @Column({ type: 'integer' })
  singlePayoutLowerLimit: number;

  @Column({ type: 'integer' })
  dailyTotalPayoutLimit: number;

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
}
