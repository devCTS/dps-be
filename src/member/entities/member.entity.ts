import { Identity } from 'src/identity/entities/identity.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Identity, (identity) => identity.members)
  @JoinColumn({ name: 'identity' })
  identity: Identity;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  referralCode: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'integer' })
  payinCommissionRate: number;

  @Column({ type: 'integer' })
  payoutCommissionRate: number;

  @Column({ type: 'integer' })
  topupCommissionRate: number;

  @Column({ type: 'integer' })
  singlePayoutUpperLimit: number;

  @Column({ type: 'integer' })
  singlePayoutLowerLimit: number;

  @Column({ type: 'integer' })
  dailyTotalPayoutLimit: number;

  @CreateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  updatedAt: Date;
}
