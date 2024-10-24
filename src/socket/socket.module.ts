import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { MemberModule } from 'src/member/member.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from 'src/member/entities/member.entity';

@Module({
  imports: [MemberModule, TypeOrmModule.forFeature([Member])],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
