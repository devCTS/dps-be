import { Identity } from 'src/identity/identity.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MerchantToChannel } from './merchantToChannel.entity';

@Entity()
export class Merchant extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  phone: string;

  @OneToOne(() => Identity, (identity) => identity.merchant, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'identity_id' })
  identity: Identity;

  @OneToMany(
    () => MerchantToChannel,
    (merchantToChannel) => merchantToChannel.merchant,
  )
  merchantToChannel: MerchantToChannel[];
}
