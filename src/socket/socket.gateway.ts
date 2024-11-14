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
import { Users } from 'src/utils/enum/enum';
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
    const roomId = `room_${userId}`;
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

  async handleSendNotification(notificationData: {
    for: number;
    userType: Users;
    text: string;
    type: string;
  }) {
    const roomId = `room_${notificationData.for}`;
    this.server.to(roomId).emit('newNotification', notificationData);
  }

  async handleSendAlert(alertData: {
    for: number;
    userType: Users;
    text: string;
    type: string;
  }) {
    const roomId = `room_${alertData.for}`;
    this.server.to(roomId).emit('newAlert', alertData);
  }
}

// Send notification to users

// method will have three arguments for type , text
// Send type and text to FE by mapping for to room id -  const roomId = `room_${for}`;
// this.server.to(roomId).emit('newNotification', {type,text});
