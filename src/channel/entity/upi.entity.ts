import { Identity } from 'src/identity/entities/identity.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Upi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  upi_id: string;

  @Column()
  mobile_number: string;

  @ManyToOne(() => Identity, (identity) => identity.upi)
  identity: Identity;
}
