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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
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

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
