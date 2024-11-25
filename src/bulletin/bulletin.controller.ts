import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BulletinService } from './bulletin.service';
import { PaginateRequestDto } from './dto/paginate.dto';
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';

@Controller('bulletin')
export class BulletinController {
  constructor(private bulletinService: BulletinService) {}

  @Get('grab-orders/:id')
  getGrabOrders(@Param('id') id: number, @UserInReq() user) {
    return this.bulletinService.getGrabOrders(user.id);
  }

  @Get('pending-orders/:id')
  getPendingOrders(@Param('id') id: number, @UserInReq() user) {
    return this.bulletinService.getPendingOrders(id, user.userId);
  }
}
