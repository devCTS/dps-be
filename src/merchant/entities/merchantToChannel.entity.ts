import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Merchant } from './merchant.entity';
import { Channel } from 'src/channel/entities/channel.entity';

@Entity()
export class MerchantToChannel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Merchant, (merchant) => merchant.merchantToChannel)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @ManyToOne(() => Channel, (channel) => channel.merchantToChannel)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;
}
