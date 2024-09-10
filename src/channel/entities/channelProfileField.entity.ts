import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Channel } from './channel.entity';
import { ChannelProfileFilledField } from './channelProfileFilledField.entity';

@Entity()
export class ChannelProfileField {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Channel, (channel) => channel.profileFields)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @Column()
  label: string;

  @Column()
  regex: string;

  @Column()
  errorMessage: string;

  @Column({ default: false })
  optional: boolean;

  @OneToMany(
    () => ChannelProfileFilledField,
    (filledField) => filledField.field,
  )
  filledFields: ChannelProfileFilledField[];
}
