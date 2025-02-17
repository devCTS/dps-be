import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import {
  ChannelName,
  GatewayName,
  NotificationStatus,
  PaymentMadeOn,
  WithdrawalMadeOn,
  WithdrawalOrderStatus,
} from './../../utils/enum/enum';
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
import { Identity } from 'src/identity/entities/identity.entity';

@Entity()
export class Withdrawal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  systemOrderId: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({
    type: 'enum',
    enum: WithdrawalOrderStatus,
    default: WithdrawalOrderStatus.PENDING,
  })
  status: WithdrawalOrderStatus;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  notificationStatus: NotificationStatus;

  @Column({ type: 'enum', enum: ChannelName })
  channel: ChannelName;

  @Column()
  channelDetails: string;

  @Column({ type: 'enum', enum: WithdrawalMadeOn, nullable: true })
  withdrawalMadeOn: WithdrawalMadeOn;

  @Column({ type: 'enum', enum: GatewayName, nullable: true })
  gatewayName: GatewayName;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  transactionReceipt: string;

  @Column({ nullable: true })
  transactionDetails: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(
    () => TransactionUpdate,
    (transactionUpdate) => transactionUpdate.withdrawalOrder,
    { nullable: true },
  )
  transactionUpdate: TransactionUpdate[];

  @ManyToOne(() => Identity, (identity) => identity.id)
  @JoinColumn({ name: 'identity_id' })
  user: Identity;
}
