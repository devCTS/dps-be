import { ChannelDetails } from 'src/channel/entities/channelDetails.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  OneToMany,
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

  @OneToMany(() => ChannelDetails, (channelDetails) => channelDetails.channel)
  channelDetails: ChannelDetails[];
}
