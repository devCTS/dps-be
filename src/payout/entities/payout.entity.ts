import { EndUser } from 'src/end-user/entities/end-user.entity';
import { Member } from 'src/member/entities/member.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Payout {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  systemOrderId: string;

  @Column({ type: 'float' })
  amount: number;

  @Column()
  status: string;

  @Column()
  channel: string;

  @Column()
  notificationStatus: string;

  @Column()
  payoutMadeVia: string;

  @Column({ nullable: true })
  gatewayName: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => EndUser, (endUser) => endUser.payout)
  @JoinColumn()
  user: EndUser;

  @ManyToOne(() => Merchant, (merchant) => merchant.payout)
  @JoinColumn()
  merchant: Merchant;

  @ManyToOne(() => Member, (member) => member.payout, { nullable: true })
  @JoinColumn()
  member: Member;
}
