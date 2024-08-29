import { IsBoolean, IsEmpty, IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Channels {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  tag: string;

  @Column({ type: Boolean, default: true })
  incoming_status: boolean;

  @Column({ type: Boolean, default: true })
  outgoing_status: boolean;
}
