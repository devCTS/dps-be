import { Member } from 'src/member/entities/member.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Team {
  @PrimaryColumn('uuid')
  teamId: string;

  @Column({ type: 'int', default: 2 })
  teamSize: number;

  @Column({ type: 'int', default: 0 })
  totalReferralCommission: number;

  @Column({ type: 'int', default: 0 })
  totalPayinCommission: number;

  @Column({ type: 'int', default: 0 })
  totalPayoutCommission: number;

  @OneToOne(() => Member, (member) => member.team)
  @JoinColumn({ name: 'team_leader' })
  teamLeader: Member;
}
