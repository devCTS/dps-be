import { Payout } from 'src/payout/entities/payout.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EndUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  mobile: string;

  @Column()
  channel: string;

  @Column()
  channelDetails: string;

  @OneToMany(() => Payout, (payout) => payout.user, { nullable: true })
  payout: Payout;
}
