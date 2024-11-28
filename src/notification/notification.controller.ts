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
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('create')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  getMyNotifications(@UserInReq() user) {
    return this.notificationService.getMyNotifications(user.id);
  }

  @Put('mark-read')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  markNotificationRead(
    @UserInReq() user,
    @Body() body: { notificationsIds: number[] },
  ) {
    return this.notificationService.markNotificationRead(user.id, body);
  }
}
