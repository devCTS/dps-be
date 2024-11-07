import { Identity } from 'src/identity/entities/identity.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Upi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  upiId: string;

  @Column()
  mobile: string;

  @Column({ nullable: true, default: false })
  isBusinessUpi: boolean;

  @Column({ default: 0 })
  channelIndex: number;

  @ManyToOne(() => Identity, (identity) => identity.upi)
  identity: Identity;
}
