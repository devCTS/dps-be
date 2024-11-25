import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AlertCreateDto } from './dto/alert-create.dto';
import { AlertService } from './alert.service';
import { Role, Users } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';

@Controller('alert')
@UseGuards(RolesGuard)
export class AlertController {
  constructor(private alertService: AlertService) {}

  @Post('create')
  @Roles(Role.ALL)
  create(@Body() alertCreateDto: AlertCreateDto) {
    return this.alertService.create(alertCreateDto);
  }

  @Post()
  @Roles(Role.ALL)
  getMyAlerts(@UserInReq() user, @Body() body: { userType: Users }) {
    return this.alertService.getMyAlerts({
      id: user.id,
      userType: body.userType,
    });
  }

  @Put('mark-read')
  @Roles(Role.ALL)
  markAlertRead(@Body() body: { alertId: number }) {
    return this.alertService.markAlertRead(body.alertId);
  }
}
