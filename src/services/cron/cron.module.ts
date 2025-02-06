import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { TopupModule } from 'src/topup/topup.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PayoutModule } from 'src/payout/payout.module';
import { PayinModule } from 'src/payin/payin.module';
import { WithdrawalModule } from 'src/withdrawal/withdrawal.module';

@Module({
  imports: [
    TopupModule,
    PayoutModule,
    PayinModule,
    WithdrawalModule,
    ScheduleModule.forRoot(),
  ],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
