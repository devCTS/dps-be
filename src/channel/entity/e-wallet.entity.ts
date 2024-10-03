import { Identity } from 'src/identity/entities/identity.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class EWallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  app: string;

  @Column()
  mobile_number: string;

  @OneToOne(() => Identity)
  @JoinColumn({ name: 'identity' })
  identity: Identity;
}
