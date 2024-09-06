import { Identity } from 'src/identity/entities/identity.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Admin extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  phone: string;

  @OneToOne(() => Identity, (identity) => identity.admin, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'identity_id' })
  identity: Identity;
}
