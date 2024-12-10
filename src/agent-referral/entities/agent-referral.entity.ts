import { Agent } from 'src/agent/entities/agent.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { ServiceRateType } from 'src/utils/enum/enum';
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
    enum: ['pending', 'utilized'],
    default: 'pending',
  })
  status: string;

  @Column('float')
  payinCommission: number;

  @Column('float')
  payoutCommission: number;

  @Column({ nullable: true, type: 'json' })
  merchantPayinServiceRate: ServiceRateType;

  @Column({ nullable: true, type: 'json' })
  merchantPayoutServiceRate: ServiceRateType;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
