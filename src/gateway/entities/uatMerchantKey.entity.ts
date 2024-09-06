import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Gateway } from './gateway.entity';

@Entity()
export class UatMerchantKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column()
  value: string;

  @ManyToOne(() => Gateway, (gateway) => gateway.uat_merchant_key)
  @JoinColumn({ name: 'gateway_id' })
  gateway: Gateway;
}
