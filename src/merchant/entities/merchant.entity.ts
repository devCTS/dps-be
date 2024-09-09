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
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  businessName: string;

  @Column({ nullable: true })
  referralCode: string;

  @Column({ default: true })
  enabled: boolean;

  @Column()
  withdrawalPassword: string;

  @Column()
  integrationId: string;

  @Column()
  businessUrl: string;

  @Column({ default: false })
  allowMemberChannelsPayin: boolean;

  @Column({ default: false })
  allowPgBackupForPayin: boolean;

  @Column({ default: false })
  allowMemberChannelsPayout: boolean;

  @Column({ default: false })
  allowPgBackupForPayout: boolean;

  @Column()
  payinServiceRate: number;

  @Column()
  payoutServiceRate: number;

  @Column()
  withdrawalServiceRate: number;

  @Column()
  minPayout: number;

  @Column()
  maxPayout: number;

  @Column()
  minWithdrawal: number;

  @Column()
  maxWithdrawal: number;

  @Column({
    enum: ['DEFAULT', 'PROPORTIONAL', 'AMOUNT_RANGE'],
    default: 'DEFAULT',
  })
  payinMode: 'DEFAULT' | 'PROPORTIONAL' | 'AMOUNT_RANGE';

  @CreateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  updatedAt: Date;

  @OneToMany(() => PayinMode, (payinMode) => payinMode.merchant)
  payinModes: PayinMode[];

  @OneToMany(() => Submerchant, (submerchant) => submerchant.merchant)
  submerchants: Submerchant[];
}
