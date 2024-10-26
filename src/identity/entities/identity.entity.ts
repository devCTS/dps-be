import { Submerchant } from 'src/sub-merchant/entities/sub-merchant.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IP } from './ip.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { Member } from 'src/member/entities/member.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Agent } from 'src/agent/entities/agent.entity';
import { NetBanking } from 'src/channel/entity/net-banking.entity';
import { EWallet } from 'src/channel/entity/e-wallet.entity';
import { Upi } from 'src/channel/entity/upi.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { Withdrawal } from 'src/withdrawal/entities/withdrawal.entity';

@Entity()
export class Identity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    enum: [
      'MERCHANT',
      'SUB_MERCHANT',
      'MEMBER',
      'SUPER_ADMIN',
      'SUB_ADMIN',
      'AGENT',
    ],
  })
  userType:
    | 'MERCHANT'
    | 'SUB_MERCHANT'
    | 'MEMBER'
    | 'SUPER_ADMIN'
    | 'SUB_ADMIN'
    | 'AGENT';

  @OneToOne(() => Merchant, (merchant) => merchant.identity, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  merchant: Merchant;

  @OneToOne(() => Member, (member) => member.identity, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  member: Member;

  @OneToOne(() => Admin, (admin) => admin.identity)
  admin: Admin;

  @OneToOne(() => Agent, (agent) => agent.identity)
  agent: Agent;

  @OneToMany(() => Submerchant, (submerchant) => submerchant.identity)
  submerchants: Submerchant[];

  @OneToMany(() => IP, (ip) => ip.identity)
  ips: IP[];

  @OneToMany(() => NetBanking, (banking) => banking.identity)
  netBanking: NetBanking[];

  @OneToMany(() => EWallet, (ewallet) => ewallet.identity)
  eWallet: EWallet[];

  @OneToMany(() => Upi, (upi) => upi.identity)
  upi: Upi[];

  @OneToMany(
    () => TransactionUpdate,
    (transactionUpdate) => transactionUpdate.user,
    { nullable: true },
  )
  transactionUpdate: TransactionUpdate[];

  @OneToMany(() => Withdrawal, (withdrawal) => withdrawal.user, {
    nullable: true,
  })
  withdrawal: Withdrawal[];
}
