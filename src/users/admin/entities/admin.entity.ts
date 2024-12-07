import { Identity } from 'src/users/identity/entities/identity.entity';
import { AdminRoles } from 'src/utils/enums/users';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  sno: number;

  @OneToOne(() => Identity, (identity) => identity.admin)
  @JoinColumn({ name: 'identity' })
  identity: Identity;

  @Column({ enum: AdminRoles })
  role: AdminRoles;

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
}
