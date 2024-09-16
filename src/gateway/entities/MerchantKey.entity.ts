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

  @ManyToOne(() => Gateway, (gateway) => gateway.uatMerchantKeys)
  @JoinColumn({ name: 'uat_gateway_id' })
  uatGateway: Gateway;

  @ManyToOne(() => Gateway, (gateway) => gateway.prodMerchantKeys)
  @JoinColumn({ name: 'prod_gateway_id' })
  prodGateway: Gateway;

  @CreateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  updatedAt: Date;
}
