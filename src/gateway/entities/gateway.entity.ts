import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
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

  @OneToMany(() => SystemConfig, (config) => config.defaultPayinGateway)
  defaultPayinGateway: SystemConfig[];

  @OneToMany(() => SystemConfig, (config) => config.defaultPayoutGateway)
  defaultPayoutGateway: SystemConfig[];

  @OneToMany(() => SystemConfig, (config) => config.defaultWithdrawalGateway)
  defaultWithdrawalGateway: SystemConfig[];
}
