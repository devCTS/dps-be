import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Channel } from './channel.entity';
import { Identity } from 'src/identity/entities/identity.entity';

@Entity()
export class ChannelDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column()
  validation: string;

  @Column()
  optional: boolean;

  @Column()
  enabled: boolean;

  @ManyToOne(() => Channel, (channel) => channel.channelDetails)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @ManyToOne(() => Identity, (identity) => identity.channelDetails)
  @JoinColumn({ name: 'identity_id' })
  identity: Identity;
}
