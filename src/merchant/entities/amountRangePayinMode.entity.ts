import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PayinMode } from './payinMode.entity';

@Entity()
export class AmountRangePayinMode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  lower: number;

  @Column({ type: 'bigint' })
  upper: number;

  @Column({ type: 'enum', enum: ['member', 'phonepe', 'razorpay'] })
  gateway: string;

  @ManyToOne(() => PayinMode, (payinMode) => payinMode.amountRangeRange)
  @JoinColumn({ name: 'payin_mode' })
  payinMode: PayinMode;
}
