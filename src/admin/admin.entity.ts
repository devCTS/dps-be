import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  user_name: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  email: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  privilages: string;

  @Column()
  enable: boolean;
}
