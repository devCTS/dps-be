import { Module } from '@nestjs/common';
import { MemberRepository } from './member.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './member.entity';
import { Identity } from 'src/identity/identity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member]), MemberRepository, Identity],
  providers: [MemberRepository, Identity],
})
export class MemberModule {}
