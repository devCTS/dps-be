import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { AlertCreateDto } from './dto/alert-create.dto';
import { AlertService } from './alert.service';
import { Role, Users } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';

@Controller('alert')
@UseGuards(RolesGuard)
export class AlertController {
  constructor(private alertService: AlertService) {}

  @Post('create')
  @Roles(
    Role.MERCHANT,
    Role.MEMBER,
    Role.AGENT,
    Role.SUB_ADMIN,
    Role.SUPER_ADMIN,
  )
  create(@Body() alertCreateDto: AlertCreateDto) {
    return this.alertService.create(alertCreateDto);
  }

  @Post('paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  paginate(@Body() body: PaginateRequestDto) {
    return this.alertService.paginate(body);
  }

  @Post()
  @Roles(
    Role.MERCHANT,
    Role.MEMBER,
    Role.AGENT,
    Role.SUB_ADMIN,
    Role.SUPER_ADMIN,
  )
  getMyAlerts(@UserInReq() user, @Body() body: { userType: Users }) {
    return this.alertService.getMyAlerts({
      id: user.id,
      userType: body.userType,
    });
  }

  @Put('mark-read')
  @Roles(
    Role.MERCHANT,
    Role.MEMBER,
    Role.AGENT,
    Role.SUB_ADMIN,
    Role.SUPER_ADMIN,
  )
  markAlertRead(@Body() body: { id: number }) {
    return this.alertService.markAlertRead(body.id);
  }
}
