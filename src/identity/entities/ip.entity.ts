import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Identity } from './identity.entity';

@Entity()
export class IP {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;

  @ManyToOne(() => Identity, (identity) => identity.ips)
  @JoinColumn({ name: 'identity' })
  identity: Identity;
}
