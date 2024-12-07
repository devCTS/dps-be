import { Identity } from 'src/users/identity/entities/identity.entity';
import { Merchant } from 'src/users/merchant/entities/merchant.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class SubMerchant {
  @PrimaryGeneratedColumn()
  sno: number;

  @OneToOne(() => Identity, (identity) => identity.submerchant)
  @JoinColumn()
  identity: Identity;

  @ManyToOne(() => Merchant, (merchant) => merchant.submerchants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  merchant: Merchant;

  @Column({ default: true })
  permissionSubmitPayouts: boolean;

  @Column({ default: true })
  permissionSubmitWithdrawals: boolean;

  @Column({ default: true })
  permissionUpdateWithdrawalProfiles: boolean;
}
