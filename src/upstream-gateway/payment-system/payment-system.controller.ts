import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PaymentSystemService } from './payment-system.service';

@Controller('payment-system')
export class PaymentSystemController {
  count: number;

  constructor(private paymentSystemService: PaymentSystemService) {
    this.count = 1;
  }

  // TODO: Currently uset get request and dummy data for testing on browser. Will be changed after
  @Get()
  payment() {
    if (this.count % 2 === 0) {
      this.count++;
      return this.paymentSystemService.getPhonepePayments();
    } else {
      this.count++;
      return this.paymentSystemService.getRazorpayPayments();
    }
  }
}
