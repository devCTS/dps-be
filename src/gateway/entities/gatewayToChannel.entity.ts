import { Channel } from 'src/channel/entities/channel.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
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
}
