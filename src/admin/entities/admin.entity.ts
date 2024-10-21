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

  @OneToOne(() => Identity, (identity) => identity.admin)
  @JoinColumn({ name: 'identity_id' })
  identity: Identity;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ enum: ['SUPER_ADMIN', 'SUB_ADMIN'] })
  role: 'SUPER_ADMIN' | 'SUB_ADMIN';

  @Column({ default: false })
  permissionAdmins: boolean;

  @Column({ default: false })
  permissionUsers: boolean;

  @Column({ default: false })
  permissionAdjustBalance: boolean;

  @Column({ default: false })
  permissionVerifyOrders: boolean;

  @Column({ default: false })
  permissionHandleWithdrawals: boolean;

  @Column({ default: false })
  permissionSystemConfig: boolean;

  @Column({ default: false })
  permissionChannelsAndGateways: boolean;

  @CreateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  updatedAt: Date;
}
