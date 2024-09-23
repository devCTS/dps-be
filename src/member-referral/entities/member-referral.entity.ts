import { Member } from 'src/member/entities/member.entity';
import { Column, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

export class MemberReferral {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  referralCode: string;

  @OneToOne(() => Member, (member) => member.referredMember)
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
}
