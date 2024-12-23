import { Identity } from 'src/identity/entities/identity.entity';
import { MemberReferral } from 'src/member-referral/entities/member-referral.entity';
import { Payin } from 'src/payin/entities/payin.entity';
import { Payout } from 'src/payout/entities/payout.entity';
import { Team } from 'src/team/entities/team.entity';
import { Topup } from 'src/topup/entities/topup.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
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

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'integer' })
  singlePayoutUpperLimit: number;

  @Column({ type: 'integer' })
  singlePayoutLowerLimit: number;

  @Column({ type: 'integer' })
  dailyTotalPayoutLimit: number;

  @Column({ nullable: true })
  telegramId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Referred any other member
  @OneToMany(() => MemberReferral, (referral) => referral.member)
  referredMember: MemberReferral[];

  // Used referral code of anther member
  @OneToOne(() => MemberReferral, (referral) => referral.referredMember)
  memberReferral: MemberReferral;

  @OneToMany(() => Payin, (payin) => payin.member)
  payin: Payin[];

  @OneToMany(() => Payout, (payout) => payout.member)
  payout: Payout[];

  @OneToMany(() => Topup, (topup) => topup.member)
  topup: Topup[];

  @Column({ type: 'float', default: 0 })
  quota: number;

  // commissions
  @Column({ type: 'float', default: 0 })
  balance: number;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ nullable: true })
  selfRegistered: boolean;

  @Column({ nullable: true })
  teamId: string;

  @ManyToOne(() => Member, { nullable: true })
  @JoinColumn({ name: 'agent' })
  agent: Member;

  @Column({ type: 'json', nullable: true })
  agentCommissions: AgentCommissionsType | null;

  @OneToOne(() => Team, (team) => team.teamLeader)
  team: Team;
}

export interface AgentCommissionsType {
  payinCommissionRate: number;
  payoutCommissionRate: number;
  topupCommissionRate: number;
}
