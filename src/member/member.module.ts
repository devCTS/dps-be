import { forwardRef, Module } from '@nestjs/common';
import { MemberRepository } from './member.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './member.entity';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { IdentityModule } from 'src/identity/identity.module';

@Module({
  imports: [
    forwardRef(() => IdentityModule),
    TypeOrmModule.forFeature([Member]),
    MemberRepository,
  ],
  providers: [MemberRepository, MemberService],
  controllers: [MemberController],
})
export class MemberModule {}
