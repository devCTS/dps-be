import { Controller, Get, UseGuards } from '@nestjs/common';
import { OverviewUserService } from './overview-user.service';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';

@Controller('overview-user')
export class OverviewUserController {
  constructor(private readonly overviewUserService: OverviewUserService) {}

  @Get('agent')
  @Roles(Role.AGENT)
  @UseGuards(RolesGuard)
  getAgentOverviewDetails(@UserInReq() user) {
    return this.overviewUserService.getAgentOverviewDetails(+user.id);
  }

  @Get('merchant')
  @Roles(Role.MERCHANT)
  @UseGuards(RolesGuard)
  getMerchantOverviewDetails(@UserInReq() user) {
    return this.overviewUserService.getMerchantOverviewDetails(+user.id);
  }

  @Get('member')
  @Roles(Role.MEMBER)
  @UseGuards(RolesGuard)
  getMemberOverviewDetails(@UserInReq() user) {
    return this.overviewUserService.getMemberOverviewDetails(+user.id);
  }
}
