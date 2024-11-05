import { forwardRef, Module } from '@nestjs/common';
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
import { ChannelModule } from 'src/channel/channel.module';
import { Topup } from 'src/topup/entities/topup.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, TransactionUpdate, Topup]),
    IdentityModule,
    JwtModule,
    MemberReferralModule,
    forwardRef(() => PayoutModule),
    TransactionUpdatesModule,
    ChannelModule,
  ],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
