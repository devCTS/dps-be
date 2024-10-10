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

  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @Column({ type: 'enum', enum: ChannelName })
  channel: ChannelName;

  @Column({ type: 'enum', enum: CallBackStatus })
  callbackStatus: CallBackStatus;

  @Column({ type: 'enum', enum: PaymentMadeOn })
  payinMadeOn: PaymentMadeOn;

  @Column({ nullable: true, type: 'enum', enum: GatewayName })
  gatewayName: GatewayName;

  @Column()
  user: string;

  @Column()
  merchant: string;

  @Column()
  member: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @OneToMany(
    () => TransactionUpdate,
    (transactionUpdate) => transactionUpdate.payinOrder,
    { nullable: true },
  )
  transactionUpdate: TransactionUpdate[];
}
