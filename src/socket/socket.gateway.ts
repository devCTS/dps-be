// online-status.gateway.ts
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Member } from 'src/member/entities/member.entity';
import { MemberService } from 'src/member/member.service';
import { AlertType, NotificationType, Users } from 'src/utils/enum/enum';
import { getTextForAlert, getTextForNotification } from 'src/utils/utils';
import { Repository } from 'typeorm';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(Member)
    private readonly memberService: Repository<Member>,
  ) {}
  memberId = null;

  private userRooms: Map<string, string> = new Map();

  handleConnection(socket: Socket) {}

  handleDisconnect(socket: Socket) {
    this.leaveRoom(socket);
  }

  private async leaveRoom(socket: Socket) {
    const roomId = this.userRooms.get(socket.id);
    if (roomId) {
      socket.leave(roomId);
      this.userRooms.delete(socket.id);
      await this.memberService.update(this.memberId, {
        isOnline: false,
      });
      this.server.to(roomId).emit('userLeft', socket.id);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    socket: Socket,
    { userId, userType }: { userId: number; userType: Users },
  ) {
    if (userType === Users.MEMBER) {
      await this.memberService.update(userId, {
        isOnline: true,
      });
    }
    this.memberId = userId;
    const roomId = `${userType}_${userId}`;
    socket.join(roomId);
    this.userRooms.set(socket.id, roomId);
    this.server.to(roomId).emit('userJoined', socket.id);
  }

  @SubscribeMessage('changeStatus')
  async handleChangeStatus(socket: Socket, status: boolean) {
    const roomId = this.userRooms.get(socket.id);
    if (roomId) {
      await this.memberService.update(this.memberId, {
        isOnline: status,
      });

      socket.emit('statusUpdate', { userId: socket.id, status: status });
    }
  }

  async handleBroadcastUsers({
    text,
    data,
    type,
    id,
    memberId,
  }: {
    text: string;
    data: any;
    type: NotificationType;
    id: number;
    memberId: number;
  }) {
    this.server
      .to(`Member_${memberId}`)
      .emit('newNotification', { data, text, type, date: new Date(), id: id });
  }

  async handleSendAlertsToAllAdmins({
    data,
    type,
    id,
  }: {
    data: any;
    type: AlertType;
    id: number;
  }) {
    const adminRooms = [...this.userRooms.values()].filter((item) =>
      item.includes('Admin'),
    );

    this.server
      .to(adminRooms)
      .emit('newAlert', { data, type, date: new Date(), id: id });
  }

  async handleSendNotification(notificationData: {
    for: number;
    userType: Users;
    type: NotificationType;
    data: any;
    id: number;
  }) {
    const { data, type, id } = notificationData;
    const text = getTextForNotification(type, data);
    if (
      notificationData.type === NotificationType.GRAB_PAYOUT ||
      notificationData.type === NotificationType.GRAB_TOPUP
    ) {
      this.handleBroadcastUsers({
        text,
        data,
        type,
        id,
        memberId: notificationData.for,
      });
    } else {
      const roomId = `Member_${notificationData.for}`;
      this.server
        .to(roomId)
        .emit('newNotification', { data, type, text, date: new Date() });
    }
  }

  async handleSendAlert(alertData: {
    for: number;
    userType: Users;
    data: any;
    type: AlertType;
    id: number;
  }) {
    const { userType, data, type } = alertData;
    const text = getTextForAlert(type, data);
    const roomId = `${userType}_${alertData.for}`;
    this.server
      .to(roomId)
      .emit('newAlert', { data, type, text, date: new Date(), userType });
  }
}
