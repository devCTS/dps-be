import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { MemberService } from 'src/member/member.service';
import { Member } from 'src/member/entities/member.entity';
import { NotificationReadStatus, Users } from 'src/utils/enum/enum';
import { MarkNotificationReadDto } from './dto/mark-notification-read.dto';
import { SocketGateway } from 'src/socket/socket.gateway';

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
    const { for: memberId } = createNotificationDto;

    const member = await this.memberRepository.findOneBy({ id: memberId });

    if (!member) throw new NotFoundException('Member not found.');

    try {
      await this.notificationRepository.save(createNotificationDto);
      this.socketGateway.handleSendNotification({
        for: memberId,
        userType: Users.MEMBER,
        text: 'This is notification',
      });

      return HttpStatus.CREATED;
    } catch (error) {
      console.log(error);
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

    return myNotifications;
  }

  async markNotificationRead(markNotificationReadDto: MarkNotificationReadDto) {
    const { id, arrayOfNotificationIds } = markNotificationReadDto;
    const member = await this.memberRepository.findOneBy({ id });

    if (!member) throw new NotFoundException('Member not found.');

    const notifications = await this.notificationRepository.find({
      where: {
        id: In(arrayOfNotificationIds),
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
