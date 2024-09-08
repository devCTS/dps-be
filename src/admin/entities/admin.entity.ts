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
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Identity, (identity) => identity.admins)
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

  @Column({ enum: ['SUPER_ADMIN', 'SUB_ADMIN'] })
  role: 'SUPER_ADMIN' | 'SUB_ADMIN';

  @Column({ default: false })
  permission_admins: boolean;

  @Column({ default: false })
  permission_users: boolean;

  @Column({ default: false })
  permission_adjust_balance: boolean;

  @Column({ default: false })
  permission_verify_orders: boolean;

  @Column({ default: false })
  permission_handle_withdrawals: boolean;

  @CreateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  updated_at: Date;
}
