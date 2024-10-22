import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { MemberModule } from 'src/member/member.module';

@Module({
  imports: [MemberModule],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
