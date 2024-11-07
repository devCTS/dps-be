import { Identity } from 'src/identity/entities/identity.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EWallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  app: string;

  @Column()
  mobile: string;

  @Column({ default: 0 })
  channelIndex: number;

  @ManyToOne(() => Identity, (identity) => identity.eWallet)
  identity: Identity;
}
