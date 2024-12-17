import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { MemberModule } from 'src/member/member.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from 'src/member/entities/member.entity';
import { PayinGateway } from './payin.gateway';

@Module({
  imports: [MemberModule, TypeOrmModule.forFeature([Member])],
  providers: [SocketGateway, PayinGateway],
  exports: [SocketGateway, PayinGateway],
})
export class SocketModule {}
