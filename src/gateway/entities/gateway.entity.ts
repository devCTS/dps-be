import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { GatewayToChannel } from './gatewayToChannel.entity';
import { MerchantKey } from './MerchantKey.entity';
import { SystemConfig } from 'src/system-config/entities/system-config.entity';

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

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => MerchantKey, (key) => key.uatGateway)
  uatMerchantKeys: MerchantKey[];

  @OneToMany(() => MerchantKey, (key) => key.prodGateway)
  prodMerchantKeys: MerchantKey[];

  @OneToMany(
    () => GatewayToChannel,
    (gatewayToChannel) => gatewayToChannel.gateway,
  )
  gatewayToChannel: GatewayToChannel[];

  @OneToOne(() => SystemConfig, (config) => config.defaultPayinGateway)
  defaultPayinGateway: number;

  @OneToOne(() => SystemConfig, (config) => config.defaultPayoutGateway)
  defaultPayoutGateway: number;

  @OneToOne(() => SystemConfig, (config) => config.defaultWithdrawalGateway)
  defaultWithdrawalGateway: number;
}
