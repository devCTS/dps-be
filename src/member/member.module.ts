import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { IdentityModule } from 'src/identity/identity.module';
import { JwtModule } from 'src/services/jwt/jwt.module';
import { MemberReferralModule } from 'src/member-referral/member-referral.module';
import { PayoutModule } from 'src/payout/payout.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member]),
    IdentityModule,
    JwtModule,
    MemberReferralModule,
    PayoutModule,
  ],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
