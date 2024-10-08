import { ChannelName, GatewayName, PaymentType } from 'src/utils/enum/enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ChannelSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: GatewayName })
  gateway_name: GatewayName;

  @Column({ type: 'enum', enum: PaymentType })
  type: PaymentType;

  @Column({ type: 'enum', enum: ChannelName })
  channel_name: ChannelName;

  @Column()
  enabled: boolean;

  @Column({ type: 'float' })
  min_amount: number;

  @Column({ type: 'float' })
  max_amount: number;

  @Column({ type: 'float' })
  upstream_fee: number;
}
