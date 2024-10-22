import { Payin } from 'src/payin/entities/payin.entity';
import { Identity } from './../../identity/entities/identity.entity';
import { OrderType, UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Payout } from 'src/payout/entities/payout.entity';

@Entity()
export class TransactionUpdate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderType: OrderType;

  @Column()
  userType: UserTypeForTransactionUpdates;

  @Column({ nullable: true })
  systemOrderId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  isAgentOf: string;

  @Column({ nullable: true, type: 'float' })
  rate: number;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'float' })
  before: number;

  @Column({ type: 'float' })
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
}
