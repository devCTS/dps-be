import { Identity } from 'src/identity/entities/identity.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class NetBanking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  account_number: string;

  @Column()
  ifsc_code: string;

  @Column()
  bank_name: string;

  @Column()
  beneficiary_name: string;

  @ManyToOne(() => Identity, (identity) => identity.banking)
  identity: Identity;
}
