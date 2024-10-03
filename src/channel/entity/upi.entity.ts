import { Identity } from 'src/identity/entities/identity.entity';
import {
  Column,
  Entity,
  JoinColumn,
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

  @OneToOne(() => Identity)
  @JoinColumn({ name: 'identity' })
  identity: Identity;
}
