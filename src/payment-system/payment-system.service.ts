import { Injectable } from '@nestjs/common';

import { PhonepeService } from './phonepe/phonepe.service';
import { RazorpayService } from './razorpay/razorpay.service';
import { Response } from 'express';

@Injectable()
export class PaymentSystemService {
  constructor(
    private readonly phonepeService: PhonepeService,
    private readonly razorpayService: RazorpayService,
  ) {}

  async getPayPage(userId: string, amount: string) {
    // return await this.razorpayService.getPayPage();
    return await this.phonepeService.getPayPage(userId, amount);
  }

  async getOrderDetails(orderId: string) {
    return await this.razorpayService.razorpayPaymentStatus(orderId);
  }

  async phonepeCheckStatus(
    res: Response,
    transactionId: string,
    userId: string,
  ) {
    return await this.phonepeService.checkStatus(res, transactionId, userId);
  }
}
