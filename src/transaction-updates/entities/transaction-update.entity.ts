import { Withdrawal } from './../../withdrawal/entities/withdrawal.entity';
import { Payin } from 'src/payin/entities/payin.entity';
import { Identity } from './../../identity/entities/identity.entity';
import { OrderType, UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Payout } from 'src/payout/entities/payout.entity';
import { Topup } from 'src/topup/entities/topup.entity';

@Entity()
export class TransactionUpdate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  orderType: OrderType;

  @Column()
  userType: UserTypeForTransactionUpdates;

  @Column({ nullable: true })
  systemOrderId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  isAgentOf: string;

  @Column({ nullable: true })
  isAgentMember: boolean;

  @Column({ nullable: true, type: 'float' })
  rate: number;

  @Column({ nullable: true })
  rateText: string;

  @Column({ nullable: true, type: 'float' })
  absoluteAmount: number;

  @Column({ type: 'float', nullable: true })
  amount: number;

  @Column({ type: 'float', nullable: true })
  before: number;

  @Column({ type: 'float', nullable: true })
  after: number;

  @Column({ default: true })
  pending: boolean;

  @ManyToOne(() => Identity, (identity) => identity.transactionUpdate, {
    nullable: true,
  })
  @JoinColumn({ name: 'identity_id' })
  user: Identity;

  @ManyToOne(() => Payin, (payin) => payin.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'payin_order_id' })
  payinOrder: Payin;

  @ManyToOne(() => Payout, (payout) => payout.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'payout_order_id' })
  payoutOrder: Payout;

  @ManyToOne(() => Withdrawal, (withdrawal) => withdrawal.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'withdrawal_order_id' })
  withdrawalOrder: Withdrawal;

  @ManyToOne(() => Topup, (topup) => topup.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'topup_order' })
  topupOrder: Topup;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
