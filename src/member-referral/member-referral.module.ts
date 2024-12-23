import { Module } from '@nestjs/common';
import { MemberReferralService } from './member-referral.service';
import { MemberReferralController } from './member-referral.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberReferral } from './entities/member-referral.entity';
import { Member } from 'src/member/entities/member.entity';
import { SystemConfigModule } from 'src/system-config/system-config.module';
import { TeamModule } from 'src/team/team.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberReferral, Member]),
    SystemConfigModule,
    TeamModule,
  ],
  controllers: [MemberReferralController],
  providers: [MemberReferralService],
  exports: [MemberReferralService],
})
export class MemberReferralModule {}
