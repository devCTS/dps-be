import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('create')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get(':id')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  getMyNotifications(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.getMyNotifications(id);
  }

  @Put('mark-read/:id')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  markNotificationRead(
    @Param('id') id: number,
    @Body() body: { notificationsIds: number[] },
  ) {
    return this.notificationService.markNotificationRead({
      id,
      notificationsIds: body.notificationsIds,
    });
  }
}
