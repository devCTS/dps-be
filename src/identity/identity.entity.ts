import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';
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
  user_id: string;

  @Column({ nullable: false, unique: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Column({ nullable: false, unique: true })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @Column({ nullable: false })
  @IsNotEmpty()
  password: string;
}
