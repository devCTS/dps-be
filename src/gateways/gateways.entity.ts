import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsNumber,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Channels } from 'src/channels/channels.entity';

class MerchantKeyObj {
  @IsString()
  @IsNotEmpty()
  key_name: string;

  @IsString()
  @IsNotEmpty()
  key_value: string;
}

class ApiChannel {
  @OneToOne(() => Channels)
  @JoinColumn({ name: 'id' })
  channels: Channels;

  @IsString()
  fees: string;

  @IsNumber()
  @Min(2)
  @Max(10)
  limits: number;

  @IsBoolean()
  @IsNotEmpty()
  enable: boolean;
}

@Entity()
export class Gateways {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsString()
  logo: string;

  @Column()
  @IsBoolean()
  incoming_status: boolean;

  @Column()
  @IsBoolean()
  outgoing_status: boolean;

  @Column('jsonb')
  @Type(() => MerchantKeyObj)
  merchant_keys: MerchantKeyObj[];

  @Column('jsonb')
  @Type(() => ApiChannel)
  incoming_api_channel: ApiChannel[];

  @Column('jsonb')
  @Type(() => ApiChannel)
  outgoing_api_channel: ApiChannel[];
}
