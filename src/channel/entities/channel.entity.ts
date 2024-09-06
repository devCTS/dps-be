import { GatewayToChannel } from 'src/gateway/entities/gatewayToChannel.entity';
import { MerchantToChannel } from 'src/merchant/entities/merchantToChannel.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChannelDetails } from './channelDetails.entity';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  tag: string;

  @Column({ default: true })
  incoming_status: boolean;

  @Column({ default: true })
  outgoing_status: boolean;

  @OneToMany(
    () => MerchantToChannel,
    (merchantToChannel) => merchantToChannel.channel,
  )
  merchantToChannel: MerchantToChannel[];

  @OneToMany(
    () => GatewayToChannel,
    (gatewayToChannel) => gatewayToChannel.channel,
  )
  gatewayToChannel: GatewayToChannel[];

  @OneToMany(() => ChannelDetails, (channelDetails) => channelDetails.channel)
  channelDetails: ChannelDetails[];
}
