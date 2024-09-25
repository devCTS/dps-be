import { IsNotEmpty, IsNumber } from 'class-validator';
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

  @Column({ default: true })
  enabled: boolean;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: '0.3' })
  withdrawalServiceRate: string;

  @Column({ default: 1000 })
  minWithdrawalAmount: number;

  @Column({ default: 50000 })
  maxWithdrawalAmount: number;

  @CreateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  updatedAt: Date;
}
