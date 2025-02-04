import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Uniqpay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  incoming: boolean;

  @Column()
  outgoing: boolean;

  @Column({ nullable: true })
  uniqpay_id: string;

  @Column({ nullable: true })
  client_id: string;

  @Column({ nullable: true })
  client_secret: string;
}
