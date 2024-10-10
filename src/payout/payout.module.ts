import { Module } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { PayoutController } from './payout.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { PayoutAdminService } from './payout-admin.service';
import { PayoutMemberService } from './payout-member.service';
import { PayoutMerchantService } from './payout-merchant.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payout])],
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
