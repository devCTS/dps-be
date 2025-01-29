import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PayinService } from 'src/payin/payin.service';
import { PayoutService } from 'src/payout/payout.service';
import { TopupService } from 'src/topup/topup.service';

@Injectable()
export class CronService {
  constructor(
    private readonly topupService: TopupService,
    private readonly payoutService: PayoutService,
    private readonly payinService: PayinService,
  ) {}

  //   '0 */15 * * * *';
  @Cron(CronExpression.EVERY_5_SECONDS)
  handleCron() {
    this.topupService.checkAndCreate();
    this.payoutService.fetchPendingPayoutsAndUpdateStatus();
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  handleSandboxPayinCron() {
    this.payinService.removeOneDayOldSandboxPayins();
  }
}
