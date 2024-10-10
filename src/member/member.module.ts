import { PayoutMemberService } from './../payout/payout-member.service';
import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { IdentityModule } from 'src/identity/identity.module';
import { JwtModule } from 'src/services/jwt/jwt.module';
import { MemberReferralModule } from 'src/member-referral/member-referral.module';
import { PayoutModule } from 'src/payout/payout.module';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { TransactionUpdatesModule } from 'src/transaction-updates/transaction-updates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, TransactionUpdate]),
    IdentityModule,
    JwtModule,
    MemberReferralModule,
    PayoutModule,
    TransactionUpdatesModule,
  ],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
