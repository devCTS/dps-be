import { Controller, Get } from '@nestjs/common';
import { OverviewAdminService } from './overview-admin.service';

@Controller('overview-admin')
export class OverviewAdminController {
  constructor(private readonly overviewAdminService: OverviewAdminService) {}

  @Get('user-analytics')
  getUserAnalytics() {
    return this.overviewAdminService.getUserAnalytics();
  }
}
