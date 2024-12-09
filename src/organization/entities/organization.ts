import { Agent } from 'src/agent/entities/agent.entity';
import { Member } from 'src/member/entities/member.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Organization {
  @PrimaryColumn('uuid')
  organizationId: string;

  @Column({ type: 'int', default: 2 })
  organisationSize: number;

  @Column({ type: 'int', default: 0 })
  totalReferralCommission: number;

  @OneToOne(() => Agent, (agent) => agent.organization)
  @JoinColumn({ name: 'leader' })
  leader: Agent;
}
