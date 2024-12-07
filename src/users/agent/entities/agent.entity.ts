import { Identity } from 'src/users/identity/entities/identity.entity';
import { ChannelProfile } from 'src/utils/interfaces/channel-profile';
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
export class Agent {
  @PrimaryGeneratedColumn()
  sno: number;

  @OneToOne(() => Identity, (identity) => identity.agent)
  @JoinColumn({ name: 'identity' })
  identity: Identity;

  @Column({ nullable: true, default: null })
  agent: string;

  @Column({ type: 'json', nullable: true, default: null })
  agentCommissionRates: any;

  @Column({ nullable: true, default: null })
  teamId: string;

  @Column()
  withdrawalPassword: string;

  @Column()
  withdrawalRate: number;

  @Column()
  minWithdrawalAmount: number;

  @Column()
  maxWithdrawalAmount: number;

  @Column({ type: 'float', default: 0 })
  balance: number;

  @Column({ type: 'json', nullable: true, default: null })
  channelProfile: ChannelProfile;

  @Column({ type: 'json', nullable: true, default: null })
  commissions: CommissionInfo;

  // Referred any other
  //   @OneToMany(() => AgentReferral, (referral) => referral.agent)
  //   referred: AgentReferral[];

  // Used referrel code of another agent
  //   @OneToOne(() => AgentReferral, (referral) => referral.referredAgent)
  //   agentReferral: AgentReferral;
}
