import { Identity } from 'src/identity/entities/identity.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class NetBanking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  accountNumber: string;

  @Column()
  ifsc: string;

  @Column()
  bankName: string;

  @Column()
  beneficiaryName: string;

  @ManyToOne(() => Identity, (identity) => identity.netBanking)
  identity: Identity;
}
