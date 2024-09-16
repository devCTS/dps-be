import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChannelProfileField } from './channelProfileField.entity';
import { Identity } from 'src/identity/entities/identity.entity';
import { SystemConfig } from 'src/system-config/entities/system-config.entity';

@Entity()
export class ChannelProfileFilledField {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChannelProfileField, (field) => field.filledFields)
  @JoinColumn({ name: 'field_ref_id' })
  field: ChannelProfileField;

  @ManyToOne(() => Identity, (identity) => identity.channelProfileFilledFields)
  @JoinColumn({ name: 'identity_id' })
  identity: Identity;

  @Column()
  fieldValue: string;

  @ManyToOne(() => SystemConfig, (config) => config.defaultTopupChannels)
  @JoinColumn({ name: 'default_topup_channel_id' })
  defaultTopupChannels: SystemConfig;
}
