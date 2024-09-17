import { Identity } from 'src/identity/entities/identity.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';

@Entity()
export class Agent {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Identity, (identity) => identity.agent)
  @JoinColumn({ name: 'identity_id' })
  identity: Identity;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  referralCode: string;

  @Column({ nullable: true })
  phone: string;

  @CreateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  updatedAt: Date;
}
