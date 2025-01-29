import { Module } from '@nestjs/common';
import { MemberChannelService } from './member-channel.service';

@Module({
  providers: [MemberChannelService],
})
export class MemberChannelModule {}
