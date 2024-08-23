import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { Identity } from 'src/identity/identity.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  member_id: string;

  @Column({ nullable: false })
  @IsNotEmpty()
  first_name: string;

  @Column({ nullable: false })
  @IsNotEmpty()
  last_name: string;

  @Column({ nullable: false, unique: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Column({ nullable: false, unique: true })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @OneToOne(() => Identity)
  @JoinColumn({ name: 'user_id' })
  identity: Identity;
}
