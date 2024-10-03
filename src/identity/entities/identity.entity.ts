import { Submerchant } from 'src/sub-merchant/entities/sub-merchant.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Unique,
  OneToOne,
} from 'typeorm';
import { IP } from './ip.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { Member } from 'src/member/entities/member.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Agent } from 'src/agent/entities/agent.entity';

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

  @OneToMany(() => Merchant, (merchant) => merchant.identity, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  merchants: Merchant[];

  @OneToMany(() => Member, (member) => member.identity, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  members: Member[];

  @OneToOne(() => Admin, (admin) => admin.identity)
  admins: Admin[];

  @OneToOne(() => Agent, (agent) => agent.identity)
  agent: Agent[];

  @OneToMany(() => Submerchant, (submerchant) => submerchant.identity)
  submerchants: Submerchant[];

  @OneToMany(() => IP, (ip) => ip.identity)
  ips: IP[];
}
