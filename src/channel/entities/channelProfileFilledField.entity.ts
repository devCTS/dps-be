import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChannelProfileField } from './channelProfileField.entity';
import { Identity } from 'src/identity/entities/identity.entity';

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
  field_value: string;
}
