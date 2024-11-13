import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Member } from 'src/member/entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, Member])],
  providers: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
