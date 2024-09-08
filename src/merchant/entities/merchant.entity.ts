import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PayinMode } from './payinMode.entity';
import { Submerchant } from 'src/sub-merchant/entities/sub-merchant.entity';
import { Identity } from 'src/identity/entities/identity.entity';

@Entity()
export class Merchant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Identity, (identity) => identity.merchants)
  @JoinColumn({ name: 'identity' })
  identity: Identity;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  business_name: string;

  @Column({ nullable: true })
  referral_code: string;

  @Column({ default: true })
  enabled: boolean;

  @Column()
  withdrawal_password: string;

  @Column()
  integration_id: string;

  @Column()
  business_url: string;

  @Column({ default: false })
  allow_member_channels_payin: boolean;

  @Column({ default: false })
  allow_pg_backup_for_payin: boolean;

  @Column({ default: false })
  allow_member_channels_payout: boolean;

  @Column({ default: false })
  allow_pg_backup_for_payout: boolean;

  @Column()
  payin_service_rate: number;

  @Column()
  payout_service_rate: number;

  @Column()
  withdrawal_service_rate: number;

  @Column()
  min_payout: number;

  @Column()
  max_payout: number;

  @Column()
  min_withdrawal: number;

  @Column()
  max_withdrawal: number;

  @Column({
    enum: ['DEFAULT', 'PROPORTIONAL', 'AMOUNT_RANGE'],
    default: 'DEFAULT',
  })
  payin_mode: 'DEFAULT' | 'PROPORTIONAL' | 'AMOUNT_RANGE';

  @CreateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  updated_at: Date;

  @OneToMany(() => PayinMode, (payinMode) => payinMode.merchant)
  payinModes: PayinMode[];

  @OneToMany(() => Submerchant, (submerchant) => submerchant.merchant)
  submerchants: Submerchant[];
}
