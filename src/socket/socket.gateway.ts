// online-status.gateway.ts
import { NotFoundException } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MemberService } from 'src/member/member.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly memberService: MemberService) {}
  memberId = null;

  private userRooms: Map<string, string> = new Map();

  handleConnection(socket: Socket) {
    console.log(`User connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`User disconnected: ${socket.id}`);
    this.leaveRoom(socket);
  }

  private async leaveRoom(socket: Socket) {
    const roomId = this.userRooms.get(socket.id);
    if (roomId) {
      socket.leave(roomId);
      this.userRooms.delete(socket.id);
      await this.memberService.update(this.memberId, {
        isOnline: false,
        updateLoginCredentials: false,
      });
      this.server.to(roomId).emit('userLeft', socket.id);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(socket: Socket, userId: number) {
    const memberData = await this.memberService.findOne(userId);
    if (!memberData) throw new NotFoundException();

    this.memberId = userId;
    const roomId = `room_${userId}`;
    socket.join(roomId);
    this.userRooms.set(socket.id, roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    this.server.to(roomId).emit('userJoined', socket.id);
  }

  @SubscribeMessage('changeStatus')
  async handleChangeStatus(socket: Socket, status: boolean) {
    const roomId = this.userRooms.get(socket.id);
    if (roomId) {
      await this.memberService.update(this.memberId, {
        isOnline: status,
        updateLoginCredentials: false,
      });

      socket.emit('statusUpdate', { userId: socket.id, status: status });
    }
  }
}
