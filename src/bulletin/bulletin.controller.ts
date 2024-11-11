import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BulletinService } from './bulletin.service';
import { PaginateRequestDto } from './dto/paginate.dto';

@Controller('bulletin')
export class BulletinController {
  constructor(private bulletinService: BulletinService) {}

  @Get('grab-orders/:id')
  getGrabOrders(@Param('id') id: number) {
    return this.bulletinService.getGrabOrders();
    return [
      {
        type: 'payout',
        amount: '10',
        channel: 'net_banking',
        commission: '12',
        systemOrderId: '123',
      },
      {
        type: 'topup',
        amount: '10',
        channel: 'e_wallet',
        commission: '12',
        systemOrderId: '123',
      },
      {
        type: 'payout',
        amount: '10',
        channel: 'net_banking',
        commission: '12',
        systemOrderId: '123',
      },
    ];

    //
  }

  @Get('pending-orders/:id')
  getPendingOrders(@Param('id') id: number) {
    return this.bulletinService.getPendingOrders(id);

    return [
      {
        type: 'payout',
        amount: '10',
        channel: 'net_banking',
        commission: '12',
        systemOrderId: '123',
      },
      {
        type: 'topup',
        amount: '10',
        channel: 'e_wallet',
        commission: '12',
        systemOrderId: '123',
      },
      {
        type: 'payout',
        amount: '10',
        channel: 'net_banking',
        commission: '12',
        systemOrderId: '123',
      },
    ];

    // this.bulletinService.getGrabOrders(id);
  }
}
