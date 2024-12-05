import { Admin } from 'src/users/admin/entities/admin.entity';
import { Agent } from 'src/users/agent/entities/agent.entity';
import { Member } from 'src/users/member/entities/member.entity';
import { Merchant } from 'src/users/merchant/entities/merchant.entity';
import { SubMerchant } from 'src/users/sub-merchant/entities/sub-merchant.entity';
import { Users } from 'src/utils/enums/users';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Identity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({
    enum: Users,
  })
  userType: Users;

  @OneToOne(() => Merchant, (merchant) => merchant.identity)
  merchant: Merchant;

  @OneToOne(() => Admin, (admin) => admin.identity)
  admin: Admin;

  @OneToOne(() => Member, (member) => member.identity)
  member: Member;

  @OneToOne(() => Agent, (agent) => agent.identity)
  agent: Agent;

  @OneToOne(() => SubMerchant, (submerchant) => submerchant.identity)
  submerchant: SubMerchant;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  //   @OneToOne(() => Member, (member) => member.identity, {
  //     cascade: true,
  //     onDelete: 'CASCADE',
  //   })
  //   member: Member;

  //   @OneToOne(() => Agent, (agent) => agent.identity)
  //   agent: Agent;

  //   @OneToOne(() => Submerchant, (submerchant) => submerchant.identity)
  //   submerchant: Submerchant[];

  //   @OneToMany(
  //     () => TransactionUpdate,
  //     (transactionUpdate) => transactionUpdate.user,
  //     { nullable: true },
  //   )
  //   transactionUpdate: TransactionUpdate[];

  //   @OneToMany(() => Withdrawal, (withdrawal) => withdrawal.user, {
  //     nullable: true,
  //   })
  //   withdrawal: Withdrawal[];

  //   @OneToMany(() => FundRecord, (record) => record.user, {
  //     nullable: true,
  //   })
  //   fundRecord: FundRecord[];
}
