import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PayoutService } from 'src/payout/payout.service';
import { TopupService } from 'src/topup/topup.service';

@Injectable()
export class CronService {
  constructor(
    private readonly topupService: TopupService,
    private readonly payoutService: PayoutService,
  ) {}

  //   '0 */15 * * * *';
  @Cron(CronExpression.EVERY_5_SECONDS)
  handleCron() {
    this.topupService.checkAndCreate();
    this.payoutService.fetchPendingPayoutsAndUpdateStatus();
  }
}
