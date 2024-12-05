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
export class Agent {
  @OneToOne(() => Identity, (identity) => identity.agent)
  @JoinColumn({ name: 'identity' })
  identity: Identity;

  @Column({ nullable: true })
  agent: string;

  @Column({ nullable: true })
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

  @Column('json')
  commissions: CommissionInfo;

  // Referred any other
  //   @OneToMany(() => AgentReferral, (referral) => referral.agent)
  //   referred: AgentReferral[];

  // Used referrel code of another agent
  //   @OneToOne(() => AgentReferral, (referral) => referral.referredAgent)
  //   agentReferral: AgentReferral;
}
