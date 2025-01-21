import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { TopupModule } from 'src/topup/topup.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PayoutModule } from 'src/payout/payout.module';

@Module({
  imports: [TopupModule, PayoutModule, ScheduleModule.forRoot()],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
