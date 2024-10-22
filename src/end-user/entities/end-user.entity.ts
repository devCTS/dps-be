import { Payin } from 'src/payin/entities/payin.entity';
import { Payout } from 'src/payout/entities/payout.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EndUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  mobile: string;

  @Column()
  channel: string;

  @Column({ nullable: true })
  channelDetails: string;

  @OneToMany(() => Payin, (payin) => payin.user, { nullable: true })
  payin: Payout;

  @OneToMany(() => Payout, (payout) => payout.user, { nullable: true })
  payout: Payout;
}
