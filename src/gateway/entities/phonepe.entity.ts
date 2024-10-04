import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Phonepe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  incoming: boolean;

  @Column()
  outgoing: boolean;

  @Column()
  merchant_id: string;

  @Column()
  salt_key: string;

  @Column()
  salt_index: string;

  @Column()
  sandbox_merchant_id: string;

  @Column()
  sandbox_salt_key: string;

  @Column()
  sandbox_salt_index: string;
}
