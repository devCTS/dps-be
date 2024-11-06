import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { TopupModule } from 'src/topup/topup.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [TopupModule, ScheduleModule.forRoot()],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
