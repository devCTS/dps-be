import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AlertCreateDto } from './dto/alert-create.dto';
import { AlertService } from './alert.service';
import { Users } from 'src/utils/enum/enum';

@Controller('alert')
export class AlertController {
  constructor(private alertService: AlertService) {}
  @Post('create')
  create(@Body() alertCreateDto: AlertCreateDto) {
    return this.alertService.create(alertCreateDto);
  }

  @Get('/:id')
  getMyAlerts(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userType: Users },
  ) {
    return this.alertService.getMyAlerts({ id, userType: body.userType });
  }

  @Patch('mark-read')
  markAlertRead(@Body() body: { alertId: number }) {
    return this.alertService.markAlertRead(body.alertId);
  }
}
