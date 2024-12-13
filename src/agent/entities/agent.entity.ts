import { AgentReferral } from 'src/agent-referral/entities/agent-referral.entity';
import { Identity } from 'src/identity/entities/identity.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Organization } from 'src/organization/entities/organization';
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
export class Agent {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Identity, (identity) => identity.agent)
  @JoinColumn({ name: 'identity_id' })
  identity: Identity;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ nullable: true })
  phone: string;

  @Column()
  withdrawalPassword: string;

  @Column({ type: 'float', default: 0.3 })
  withdrawalRate: number;

  @Column({ default: 1000 })
  minWithdrawalAmount: number;

  @Column({ default: 50000 })
  maxWithdrawalAmount: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Referred any other
  @OneToMany(() => AgentReferral, (referral) => referral.agent)
  referred: AgentReferral[];

  // Used referrel code of another agent
  @OneToOne(() => AgentReferral, (referral) => referral.referredAgent)
  agentReferral: AgentReferral;

  @Column({ type: 'float', default: 0 })
  balance: number;

  @OneToOne(() => Organization, (organisation) => organisation.leader)
  organization: Organization;

  @Column({ nullable: true })
  organizationId: string;

  @ManyToOne(() => Agent, (agent) => agent.referrees, { nullable: true })
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @OneToMany(() => Agent, (agent) => agent.agent)
  referrees: Agent[];

  @Column({ type: 'json', nullable: true })
  agentCommissions: AgentCommissionsType;

  @OneToMany(() => Merchant, (merchant) => merchant.agent, { nullable: true })
  referredMerchant: Merchant[];
}

export interface AgentCommissionsType {
  payinCommissionRate: number;
  payoutCommissionRate: number;
}
