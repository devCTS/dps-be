import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProdMerchantKey } from './prodMerchantKey.entity';
import { UatMerchantKey } from './uatMerchantKey.entity';
import { GatewayToChannel } from './gatewayToChannel.entity';

@Entity()
export class Gateway {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  logo: string;

  @Column()
  incoming_status: boolean;

  @Column()
  outgoing_status: boolean;

  @OneToMany(() => ProdMerchantKey, (key) => key.gateway, { cascade: true })
  prod_merchant_key: ProdMerchantKey[];

  @OneToMany(() => UatMerchantKey, (key) => key.gateway, { cascade: true })
  uat_merchant_key: UatMerchantKey[];

  @OneToMany(
    () => GatewayToChannel,
    (gatewayToChannel) => gatewayToChannel.gateway,
  )
  gatewayToChannel: GatewayToChannel[];
}
