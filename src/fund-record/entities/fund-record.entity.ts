import { Identity } from 'src/identity/entities/identity.entity';
import { OrderType, UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
} from 'typeorm';

@Entity()
export class FundRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  orderType: OrderType;

  @Column({ nullable: true })
  name: string;

  @Column()
  balanceType: UserTypeForTransactionUpdates;

  @Column()
  systemOrderId: string;

  @Column({ type: 'float', nullable: true })
  amount: number;

  @Column({ nullable: true })
  serviceFee: number;

  @Column()
  description: string;

  @Column({ type: 'float', nullable: true })
  orderAmount: number;

  @Column({ type: 'float', nullable: true })
  before: number;

  @Column({ type: 'float', nullable: true })
  after: number;

  @ManyToOne(() => Identity, (identity) => identity.transactionUpdate, {
    nullable: true,
  })
  @JoinColumn({ name: 'identity_id' })
  user: Identity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
