import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Channel } from 'src/channel/entities/channel.entity';
import { Gateway } from './gateway.entity';

@Entity()
export class GatewayToChannel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Channel, (channel) => channel.gatewayToChannel)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @ManyToOne(() => Gateway, (gateway) => gateway.gatewayToChannel)
  @JoinColumn({ name: 'gateway_id' })
  gateway: Gateway;

  @Column()
  payinsEnabled: boolean;

  @Column()
  payoutsEnabled: boolean;

  @Column()
  payinFees: string;

  @Column()
  payoutFees: string;

  @Column()
  lowerLimitForPayins: string;

  @Column()
  upperLimitForPayins: string;

  @Column()
  lowerLimitForPayouts: string;

  @Column()
  upperLimitForPayouts: string;

  @CreateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  updatedAt: Date;
}
