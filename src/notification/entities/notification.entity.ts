import {
  NotificationReadStatus,
  NotificationType,
  Users,
} from 'src/utils/enum/enum';
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

  @Column({ nullable: true })
  for: number;

  @Column({ nullable: true, type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationReadStatus,
    default: NotificationReadStatus.UNREAD,
  })
  status: NotificationReadStatus;

  @Column({ type: 'json', nullable: true })
  data: any;
}
