import { IsNotEmpty, IsNumber } from 'class-validator';
import { AgentReferral } from 'src/agent-referral/entities/agent-referral.entity';
import { Identity } from 'src/identity/entities/identity.entity';
import { Organization } from 'src/organization/entities/organization';
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
  BeforeInsert,
  BeforeUpdate,
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

  @Column({ nullable: true })
  referralCode: string;

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

  // for organization
  @OneToOne(() => Organization, (organisation) => organisation.leader)
  organization: Organization;
}
