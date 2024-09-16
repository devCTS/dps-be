import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { GatewayToChannel } from './gatewayToChannel.entity';
import { MerchantKey } from './MerchantKey.entity';

@Entity()
export class Gateway {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ default: true })
  incomingStatus: boolean;

  @Column({ default: true })
  outgoingStatus: boolean;

  @OneToMany(() => MerchantKey, (key) => key.uatGateway)
  uatMerchantKeys: MerchantKey[];

  @OneToMany(() => MerchantKey, (key) => key.prodGateway)
  prodMerchantKeys: MerchantKey[];

  @OneToMany(
    () => GatewayToChannel,
    (gatewayToChannel) => gatewayToChannel.gateway,
  )
  gatewayToChannel: GatewayToChannel[];

  @CreateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // or 'timestamp' without time zone
  updatedAt: Date;
}
