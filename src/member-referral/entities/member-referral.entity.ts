import { Member } from 'src/member/entities/member.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class MemberReferral {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  referralCode: string;

  @ManyToOne(() => Member, (member) => member.referredMember)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @OneToOne(() => Member, (member) => member.memberReferral, { nullable: true })
  @JoinColumn({ name: 'referred_member_id' })
  referredMember: Member;

  @Column('float')
  payinCommission: number;

  @Column('float')
  payoutCommission: number;

  @Column('float')
  topupCommission: number;

  @Column('float')
  referredMemberPayinCommission: number;

  @Column('float')
  referredMemberPayoutCommission: number;

  @Column('float')
  referredMemberTopupCommission: number;

  @Column({
    enum: ['pending', 'utilized'],
    default: 'pending',
  })
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
