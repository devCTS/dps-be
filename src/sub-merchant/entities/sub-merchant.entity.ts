import { Identity } from 'src/identity/entities/identity.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
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
export class Submerchant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Merchant, (merchant) => merchant.submerchants)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @ManyToOne(() => Identity, (identity) => identity.submerchants)
  @JoinColumn({ name: 'identity_id' })
  identity: Identity;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: true })
  permission_submit_payouts: boolean;

  @Column({ default: true })
  permission_submit_withdrawals: boolean;

  @Column({ default: true })
  permission_update_withdrawal_profiles: boolean;

  @CreateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  updated_at: Date;
}
