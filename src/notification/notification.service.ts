import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, In, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { MemberService } from 'src/member/member.service';
import { Member } from 'src/member/entities/member.entity';
import { NotificationReadStatus, Users } from 'src/utils/enum/enum';
import { MarkNotificationReadDto } from './dto/mark-notification-read.dto';
import { SocketGateway } from 'src/socket/socket.gateway';
import { getTextForNotification } from 'src/utils/utils';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    private socketGateway: SocketGateway,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const { type, data } = createNotificationDto;

    const onlineMembers = await this.memberRepository.find({
      where: {
        isOnline: true,
      },
    });

    try {
      const notifications = onlineMembers.map(async (member) => {
        const createdNotification = await this.notificationRepository.save({
          ...createNotificationDto,
          for: member.id,
        });

        await this.socketGateway.handleSendNotification({
          for: member.id,
          userType: Users.MEMBER,
          type,
          data,
          id: createdNotification.id,
        });
      });

      await Promise.all(notifications);

      return HttpStatus.CREATED;
    } catch (error) {
      console.error('Error creating notifications:', error);
      throw new Error('Failed to create notifications');
    }
  }

  async getMyNotifications(id: number) {
    const member = await this.memberRepository.findOneBy({ id });

    if (!member) throw new NotFoundException('Member not found.');

    const myNotifications = await this.notificationRepository.find({
      where: {
        for: id,
        status: NotificationReadStatus.UNREAD,
      },
    });

    return myNotifications.map((item) => ({
      id: item.id,
      type: item.type,
      text: getTextForNotification(item.type, item.data),
      date: item.createdAt,
      data: item.data,
    }));
  }

  async markNotificationRead(
    id: number,
    markNotificationReadDto: MarkNotificationReadDto,
  ) {
    const { notificationsIds } = markNotificationReadDto;
    const member = await this.memberRepository.findOneBy({ id });

    if (!member) throw new NotFoundException('Member not found.');

    const notifications = await this.notificationRepository.find({
      where: {
        id: In(notificationsIds),
        for: id,
      },
    });

    if (notifications.length === 0) {
      throw new NotFoundException(
        'No notifications found for the specified IDs.',
      );
    }

    notifications.forEach(async (notification) => {
      notification.status = NotificationReadStatus.READ;
      await this.notificationRepository.save(notification);
    });

    return HttpStatus.OK;
  }
}
