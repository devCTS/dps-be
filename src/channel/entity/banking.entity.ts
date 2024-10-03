import { Identity } from 'src/identity/entities/identity.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Banking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  account_number: string;

  @Column()
  ifsc_code: string;

  @Column()
  bank_name: string;

  @Column()
  beneficiary_name: string;

  @OneToOne(() => Identity)
  @JoinColumn({ name: 'identity' })
  identity: Identity;
}
