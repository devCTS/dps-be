import { Member } from 'src/member/entities/member.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Team {
  @PrimaryGeneratedColumn('uuid')
  teamId: string;

  @Column({ type: 'int', default: 2 })
  teamSize: number;

  @Column({ type: 'float', default: 0 })
  totalReferralCommission: number;

  @Column({ type: 'float', default: 0 })
  totalPayinCommission: number;

  @Column({ type: 'float', default: 0 })
  totalPayoutCommission: number;

  @Column({ type: 'float', default: 0 })
  totalQuota: number;

  @OneToOne(() => Member, (member) => member.team)
  @JoinColumn({ name: 'team_leader' })
  teamLeader: Member;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
