import { Channels } from 'src/utils/enums/channels';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ChannelSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  tagName: string;

  @Column()
  incoming: boolean;

  @Column()
  outgoing: boolean;

  @Column({ type: 'enum', enum: Channels })
  name: Channels;
}
