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
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  referral_code: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'integer' })
  payin_commission_rate: number;

  @Column({ type: 'integer' })
  payout_commission_rate: number;

  @Column({ type: 'integer' })
  topup_commission_rate: number;

  @Column({ type: 'integer' })
  single_payout_upper_limit: number;

  @Column({ type: 'integer' })
  single_payout_lower_limit: number;

  @Column({ type: 'integer' })
  daily_total_payout_limit: number;

  @CreateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  updated_at: Date;
}
