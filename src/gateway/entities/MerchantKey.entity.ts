import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Gateway } from './gateway.entity';

@Entity()
export class MerchantKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column()
  value: string;

  @Column({ enum: ['prod', 'uat'] })
  type: string;

  @ManyToOne(() => Gateway, (gateway) => gateway.merchantKey)
  @JoinColumn({ name: 'gateway_id' })
  gateway: Gateway;

  @CreateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  updatedAt: Date;
}
