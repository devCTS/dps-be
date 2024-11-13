import { NotificationReadStatus, Users } from 'src/utils/enum/enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column()
  for: number;

  @Column({ nullable: true })
  type: string;

  @Column({
    type: 'enum',
    enum: NotificationReadStatus,
    default: NotificationReadStatus.UNREAD,
  })
  status: NotificationReadStatus;

  @Column({ type: 'json', nullable: true })
  data: any;
}
