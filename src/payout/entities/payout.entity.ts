import { EndUser } from 'src/end-user/entities/end-user.entity';
import { Member } from 'src/member/entities/member.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import {
  ChannelName,
  GatewayName,
  NotificationStatus,
  OrderStatus,
} from 'src/utils/enum/enum';
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
export class Payout {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  systemOrderId: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'enum', enum: OrderStatus })
  status: string;

  @Column({ type: 'enum', enum: ChannelName })
  channel: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  notificationStatus: string;

  @Column()
  payoutMadeVia: string;

  @Column({ type: 'enum', enum: GatewayName, nullable: true })
  gatewayName: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  receipt: string;

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

  @OneToMany(
    () => TransactionUpdate,
    (transactionUpdate) => transactionUpdate.payinOrder,
    { nullable: true },
  )
  transactionUpdate: TransactionUpdate[];
}
