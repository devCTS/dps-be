import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TopupService } from 'src/topup/topup.service';

@Injectable()
export class CronService {
  constructor(private readonly topupService: TopupService) {}

  //   '0 */15 * * * *';
  @Cron(CronExpression.EVERY_5_SECONDS)
  handleCron() {
    this.topupService.checkAndCreate();
  }
}
