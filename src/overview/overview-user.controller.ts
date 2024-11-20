import { Controller, Get, Param } from '@nestjs/common';
import { OverviewUserService } from './overview-user.service';

@Controller('overview-user')
export class OverviewController {
  constructor(private readonly overviewUserService: OverviewUserService) {}

  @Get('agent/:id')
  getAgentOverviewDetails(@Param('id') id: string) {
    return this.overviewUserService.getAgentOverviewDetails(+id);
  }
}
