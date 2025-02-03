import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Payin } from 'src/payin/entities/payin.entity';
import { Payout } from 'src/payout/entities/payout.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class EndUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  mobile: string;

  @Column()
  channel: string;

  @Column({ nullable: true })
  channelDetails: string;

  @Column({ default: false })
  isBlacklisted: boolean;

  @Column({ type: 'float', default: 0 })
  totalPayinAmount: number;

  @Column({ type: 'float', default: 0 })
  totalPayoutAmount: number;

  @OneToMany(() => Payin, (payin) => payin.user, { nullable: true })
  payin: Payin[];

  @OneToMany(() => Payout, (payout) => payout.user, { nullable: true })
  payout: Payout[];

  @ManyToOne(() => Merchant, (merchant) => merchant.endUser, { nullable: true })
  @JoinColumn()
  merchant: Merchant;

  @Column({ nullable: true })
  contactId: string;

  @Column({ nullable: true })
  fundAccountId: string;

  @Column({ nullable: true, enum: ['vpa', 'bank_account'] })
  fundAccountType: 'vpa' | 'bank_account';

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
