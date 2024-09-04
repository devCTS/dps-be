import { Identity } from 'src/identity/identity.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @OneToOne(() => Identity, (identity) => identity.merchant)
  @JoinColumn({ name: 'identity_id' })
  identity: Identity;
}
