import { Admin } from 'src/admin/entities/admin.entity';
import { Member } from 'src/member/entities/member.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { SubMerchant } from 'src/sub-merchant/entities/sub-merchant.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Identity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  user_name: string;

  @Column()
  password: string;

  @OneToOne(() => Merchant, (merchant) => merchant.identity)
  merchant: Merchant;

  @OneToOne(() => Member, (member) => member.identity)
  member: Member;

  @OneToOne(() => Admin, (admin) => admin.identity)
  admin: Admin;

  @OneToOne(() => SubMerchant, (subMerchant) => subMerchant.identity)
  subMerchant: SubMerchant;
}
