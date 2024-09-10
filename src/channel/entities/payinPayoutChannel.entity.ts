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
export class PayinPayoutChannel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Channel, (channel) => channel.payinPayoutChannels)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @ManyToOne(() => Identity, (identity) => identity.payinPayoutChannels)
  @JoinColumn({ name: 'identity_id' })
  identity: Identity;

  @Column({ enum: ['Payout', 'Payin'] })
  type: 'Payout' | 'Payin';
}
