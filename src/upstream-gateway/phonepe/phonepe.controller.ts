import { Controller, Get, Param, Post, Redirect } from '@nestjs/common';
import { PhonepeService } from './phonepe.service';

@Controller('phonepe')
export class PhonepeController {
  constructor(private phonepeService: PhonepeService) {}

  @Get()
  phonepePayement() {
    return this.phonepeService.phonepePayement();
  }

  @Get('/:transactionId')
  getPaymentStatus(@Param('transactionId') transactionId: string) {
    return this.phonepeService.checkStatus(transactionId);
  }
}
