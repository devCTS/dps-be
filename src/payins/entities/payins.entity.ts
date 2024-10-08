import {
  ChannelName,
  GatewayName,
  OrderStatus,
  PaymentMadeOn,
} from 'src/utils/enum/enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Payins {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  systemOrderId: string;

  @Column()
  merchantOrderId: string;

  @Column()
  amount: number;

  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @Column({ type: 'enum', enum: ChannelName })
  channel: ChannelName;

  @Column()
  callbackStatus: string;

  @Column({ type: 'enum', enum: PaymentMadeOn })
  payinMadeOn: PaymentMadeOn;

  @Column({ nullable: true, type: 'enum', enum: GatewayName })
  gatewayName: GatewayName;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
