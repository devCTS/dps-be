import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Merchant } from './merchant.entity';
import { ProportionalPayinMode } from './proportionalPayinMode.entity';
import { AmountRangePayinMode } from './amountRangePayinMode.entity';

@Entity()
export class PayinMode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @ManyToOne(() => Merchant, (merchant) => merchant.payinModes)
  @JoinColumn({ name: 'merchant' })
  merchant: Merchant;

  @Column({ type: 'integer' })
  number: number;

  @OneToMany(() => ProportionalPayinMode, (mode) => mode.payinMode)
  proportionalPayinModes: ProportionalPayinMode[];

  @OneToMany(() => AmountRangePayinMode, (mode) => mode.payinMode)
  amountRangePayinModes: AmountRangePayinMode[];
}
