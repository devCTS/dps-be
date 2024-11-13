import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}
  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get('/:id')
  getMyNotifications(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.getMyNotifications(id);
  }

  @Post('mark-read/:id')
  markNotificationRead(
    @Param('id') id: number,
    @Body() arrayOfNotificationIds: number[],
  ) {
    return this.notificationService.markNotificationRead({
      id,
      arrayOfNotificationIds,
    });
  }
}
