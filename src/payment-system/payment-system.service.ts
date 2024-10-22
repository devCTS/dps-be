import { Injectable } from '@nestjs/common';

import { PhonepeService } from './phonepe/phonepe.service';
import { RazorpayService } from './razorpay/razorpay.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class PaymentSystemService {
  constructor(
    private readonly phonepeService: PhonepeService,
    private readonly razorpayService: RazorpayService,
    private readonly httpService: HttpService,
  ) {}

  async getPayPage(userId: string, amount: string) {
    return await this.razorpayService.getPayPage();
    // return await this.phonepeService.getPayPage();
  }

  async getOrderDetails(orderId) {
    return await this.razorpayService.razorpayPaymentStatus(orderId);
  }

  async validateBusinessUrl(url: string): Promise<boolean> {
    try {
      const observable = await this.httpService.get(url);
      const response = await firstValueFrom(observable);
      return response.status === 200 ? true : false;
    } catch (error) {
      return false;
    }
  }
}
