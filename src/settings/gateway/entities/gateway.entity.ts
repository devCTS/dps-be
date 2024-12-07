import { Gateway } from 'src/utils/enums/gateways';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

interface ChannelInGatewaySettings {
  incoming: {
    enabled: boolean;
    minAmount: number;
    maxAmount: number;
    upstreamFee: number;
  };

  outgoing: {
    enabled: boolean;
    minAmount: number;
    maxAmount: number;
    upstreamFee: number;
  };
}

@Entity()
export class GatewaySettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: Gateway })
  name: Gateway;

  @Column()
  incoming: boolean;

  @Column()
  outgoing: boolean;

  @Column('json')
  secretKeys: any;

  @Column('json')
  upi: ChannelInGatewaySettings;

  @Column('json')
  netbanking: ChannelInGatewaySettings;

  @Column('json')
  eWallet: ChannelInGatewaySettings;
}
