import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Payu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  incoming: boolean;

  @Column()
  outgoing: boolean;

  @Column()
  merchant_id: string;

  @Column()
  client_id: string;

  @Column()
  client_secret: string;

  @Column()
  sandbox_merchant_id: string;

  @Column()
  sandbox_client_id: string;

  @Column()
  sandbox_client_secret: string;
}
