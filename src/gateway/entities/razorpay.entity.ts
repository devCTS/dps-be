import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Razorpay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  incoming: boolean;

  @Column()
  outgoing: boolean;

  @Column()
  key_secret: string;

  @Column()
  key_id: string;

  @Column()
  sandbox_key_id: string;

  @Column()
  sandbox_key_secret: string;
}
