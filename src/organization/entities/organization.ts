import { Agent } from 'src/agent/entities/agent.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  organizationId: string;

  @Column({ type: 'int', default: 2 })
  organizationSize: number;

  @Column({ type: 'float', default: 0 })
  totalReferralCommission: number;

  @OneToOne(() => Agent, (agent) => agent.organization)
  @JoinColumn({ name: 'leader' })
  leader: Agent;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
