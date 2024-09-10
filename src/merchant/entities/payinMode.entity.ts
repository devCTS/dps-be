import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Merchant } from './merchant.entity';
import { ProportionalPayinMode } from './proportionalPayinMode.entity';
import { AmountRangePayinMode } from './amountRangePayinMode.entity';

@Entity()
export class PayinMode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: ['PROPORTIONAL', 'AMOUNT_RANGE'] })
  type: 'PROPORTIONAL' | 'AMOUNT_RANGE';

  @OneToOne(() => Merchant, (merchant) => merchant.payinModeDetails)
  @JoinColumn({ name: 'merchant' })
  merchant: Merchant;

  @Column()
  number: number;

  @OneToMany(() => ProportionalPayinMode, (mode) => mode.payinMode)
  proportionalRange: ProportionalPayinMode[];

  @OneToMany(() => AmountRangePayinMode, (mode) => mode.payinMode)
  amountRangeRange: AmountRangePayinMode[];
}
