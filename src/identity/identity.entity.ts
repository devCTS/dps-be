import { Member } from 'src/member/member.entity';
import { Merchant } from 'src/merchant/merchant.entity';
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
  member: Merchant;
}
