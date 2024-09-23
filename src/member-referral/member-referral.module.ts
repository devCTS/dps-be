import { Module } from '@nestjs/common';
import { MemberReferralService } from './member-referral.service';
import { MemberReferralController } from './member-referral.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberReferral } from './entities/member-referral.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MemberReferral])],
  controllers: [MemberReferralController],
  providers: [MemberReferralService],
})
export class MemberReferralModule {}
