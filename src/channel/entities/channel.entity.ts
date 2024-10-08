import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChannelProfileField } from './channelProfileField.entity';
import { PayinPayoutChannel } from './payinPayoutChannel.entity';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  tag: string;

  @Column({ default: true })
  incomingStatus: boolean;

  @Column({ default: true })
  outgoingStatus: boolean;

  @Column({ nullable: true })
  logo: string;

  @CreateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  updatedAt: Date;

  @OneToMany(() => ChannelProfileField, (field) => field.channel, {
    eager: true,
  }) // Eager load the related fields
  profileFields: ChannelProfileField[];

  @OneToMany(
    () => PayinPayoutChannel,
    (payinPayoutChannel) => payinPayoutChannel.channel,
    { eager: true },
  ) // Eager load the payin/payout channels
  payinPayoutChannels: PayinPayoutChannel[];
}
