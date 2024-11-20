import { Controller, Get, Param } from '@nestjs/common';
import { OverviewUserService } from './overview-user.service';

@Controller('overview-user')
export class OverviewController {
  constructor(private readonly overviewUserService: OverviewUserService) {}

  @Get('agent/:id')
  getAgentOverviewDetails(@Param('id') id: string) {
    return this.overviewUserService.getAgentOverviewDetails(+id);
  }

  @Get('merchant/:id')
  getMerchantOverviewDetails(@Param('id') id: string) {
    return this.overviewUserService.getMerchantOverviewDetails(+id);
  }

  @Get('member/:id')
  getMemberOverviewDetails(@Param('id') id: string) {
    return this.overviewUserService.getMemberOverviewDetails(+id);
  }
}
