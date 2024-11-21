import { AlertReadStatus, AlertType, Users } from 'src/utils/enum/enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  for: number;

  @Column({ nullable: true, type: 'enum', enum: AlertType })
  type: AlertType;

  @Column({ type: 'enum', enum: Users })
  userType: Users;

  @Column({
    type: 'enum',
    enum: AlertReadStatus,
    default: AlertReadStatus.UNREAD,
  })
  status: AlertReadStatus;

  @Column({ type: 'json', nullable: true })
  data: any;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
