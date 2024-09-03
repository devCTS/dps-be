import { Channels } from 'src/channels/channels.entity';
import {
  Column,
  Entity,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Merchant {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  business_name: string;

  @Column()
  business_urls: string;

  @Column({ unique: true })
  user_name: string;

  @Column()
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column()
  login_password: string;

  @Column()
  withdrawal_password: string;

  @Column({ default: 0 })
  balance: string;

  @Column()
  payin_channels: string;

  @Column()
  payout_channels: Channels[];

  @Column()
  allow_member_channel_payin: boolean;

  @Column()
  allow_payin_timeout_fallback: boolean;

  @Column()
  payin_service_rate: number;

  @Column()
  payout_service_rate: number;

  @Column()
  payout_limit: string;

  @Column()
  allow_member_channel_payout: boolean;

  @Column()
  allow_payout_timeout_fallback: boolean;

  @Column()
  withdrawal_channels: string;

  @Column()
  withdrawal_service_rate: string;

  @Column()
  minimum_withdrawal: string;

  @Column()
  max_withdrawal: string;

  @Column()
  agent: string;

  @Column()
  status: boolean;

  @Column()
  ip_restriction: string;

  @Column({ default: 'Default' })
  channel_mode: string;

  @Column()
  sub_accounts: string;
}
