import { ChannelName, GatewayName, PaymentType } from 'src/utils/enum/enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ChannelSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: GatewayName })
  gatewayName: GatewayName;

  @Column({ type: 'enum', enum: PaymentType })
  type: PaymentType;

  @Column({ type: 'enum', enum: ChannelName })
  channelName: ChannelName;

  @Column()
  enabled: boolean;

  @Column({ type: 'float' })
  minAmount: number;

  @Column({ type: 'float' })
  maxAmount: number;

  @Column({ type: 'float' })
  upstreamFee: number;
}
