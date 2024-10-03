import { Identity } from 'src/identity/entities/identity.entity';
import { ChannelName } from 'src/utils/enum/enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Config {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  tag: string;

  @Column()
  incoming: boolean;

  @Column()
  outgoing: boolean;

  @Column({ type: 'enum', enum: ChannelName })
  name: ChannelName;

  @ManyToOne(() => Identity, (identity) => identity.config)
  identity: Identity;
}
