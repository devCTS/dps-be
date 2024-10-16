import { Module } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { PayoutController } from './payout.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { PayoutAdminService } from './payout-admin.service';
import { PayoutMemberService } from './payout-member.service';
import { PayoutMerchantService } from './payout-merchant.service';
import { TransactionUpdatesModule } from 'src/transaction-updates/transaction-updates.module';
import { EndUserModule } from 'src/end-user/end-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payout]),
    TransactionUpdatesModule,
    EndUserModule,
  ],
  controllers: [PayoutController],
  providers: [
    PayoutService,
    PayoutAdminService,
    PayoutMemberService,
    PayoutMerchantService,
  ],
  exports: [
    PayoutService,
    PayoutAdminService,
    PayoutMemberService,
    PayoutMerchantService,
  ],
})
export class PayoutModule {}
