import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PayinMode } from './payinMode.entity';

@Entity()
export class ProportionalPayinMode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  ratio: number;

  @Column({ type: 'enum', enum: ['member', 'phonepe', 'razorpay'] })
  gateway: string;

  @ManyToOne(() => PayinMode, (payinMode) => payinMode.proportionalRange)
  @JoinColumn({ name: 'payin_mode' })
  payinMode: PayinMode;
}
