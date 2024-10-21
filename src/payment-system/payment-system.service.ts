import { Injectable } from '@nestjs/common';

import { PhonepeService } from './phonepe/phonepe.service';
import { RazorpayService } from './razorpay/razorpay.service';

@Injectable()
export class PaymentSystemService {
  constructor(
    private readonly phonepeService: PhonepeService,
    private readonly razorpayService: RazorpayService,
  ) {}

  async getPayPage(userId: string, amount: string) {
    return await this.razorpayService.getPayPage();
    // return await this.phonepeService.getPayPage();
  }

  async getOrderDetails(orderId) {
    return await this.razorpayService.razorpayPaymentStatus(orderId);
  }
}
