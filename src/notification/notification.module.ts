import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Member } from 'src/member/entities/member.entity';
import { SocketGateway } from 'src/socket/socket.gateway';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, Member]), SocketModule],
  providers: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
