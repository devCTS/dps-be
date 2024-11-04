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

  @Column({ default: false })
  isBusiness: boolean;

  @ManyToOne(() => Identity, (identity) => identity.upi)
  identity: Identity;
}
