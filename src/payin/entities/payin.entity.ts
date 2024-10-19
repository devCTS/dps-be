import { EndUser } from 'src/end-user/entities/end-user.entity';
import { Member } from 'src/member/entities/member.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import {
  CallBackStatus,
  ChannelName,
  GatewayName,
  OrderStatus,
  PaymentMadeOn,
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
export class Payin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  systemOrderId: string;

  @Column()
  merchantOrderId: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.INITIATED })
  status: OrderStatus;

  @Column({ type: 'enum', enum: ChannelName })
  channel: ChannelName;

  @Column({
    type: 'enum',
    enum: CallBackStatus,
    default: CallBackStatus.PENDING,
  })
  callbackStatus: CallBackStatus;

  @Column({ type: 'enum', enum: PaymentMadeOn, nullable: true })
  payinMadeOn: PaymentMadeOn;

  @Column({ nullable: true, type: 'enum', enum: GatewayName })
  gatewayName: GatewayName;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column({ type: 'float', nullable: true })
  gatewayServiceRate: number;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  transactionReceipt: string;

  @Column({ nullable: true })
  transactionDetails: string;

  @ManyToOne(() => EndUser, (endUser) => endUser.payin)
  @JoinColumn({ name: 'enduser_id' })
  user: EndUser;

  @ManyToOne(() => Merchant, (merchant) => merchant.payin)
  @JoinColumn()
  merchant: Merchant;

  @ManyToOne(() => Member, (member) => member.payin, { nullable: true })
  @JoinColumn()
  member: Member;

  @OneToMany(
    () => TransactionUpdate,
    (transactionUpdate) => transactionUpdate.payinOrder,
    { nullable: true },
  )
  transactionUpdate: TransactionUpdate[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
