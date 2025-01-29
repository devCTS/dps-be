import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { TopupModule } from 'src/topup/topup.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PayoutModule } from 'src/payout/payout.module';
import { PayinModule } from 'src/payin/payin.module';

@Module({
  imports: [TopupModule, PayoutModule, PayinModule, ScheduleModule.forRoot()],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
