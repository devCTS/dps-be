import { Agent } from 'src/agent/entities/agent.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class AgentReferral {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  referralCode: string;

  @ManyToOne(() => Agent, (agent) => agent.referred)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @OneToOne(() => Agent, (agent) => agent.agentReferral, { nullable: true })
  @JoinColumn({ name: 'referred_agent_id' })
  referredAgent: Agent;

  @OneToOne(() => Merchant, (merchant) => merchant.agentReferral, {
    nullable: true,
  })
  @JoinColumn({ name: 'referred_merchant_id' })
  referredMerchant: Merchant;

  @Column({ enum: ['merchant', 'agent'], default: 'agent' })
  agentType: 'merchant' | 'agent';

  @Column({
    enum: ['pending', 'rejected', 'approved', 'utilized'],
    default: 'pending',
  })
  status: string;

  @Column('float')
  payinCommission: number;

  @Column('float')
  payoutCommission: number;

  @Column('float', { nullable: true })
  merchantPayinServiceRate: number;

  @Column('float', { nullable: true })
  merchantPayoutServiceRate: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
