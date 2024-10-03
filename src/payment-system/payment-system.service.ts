import { Injectable } from '@nestjs/common';
import { CreatePaymentSystemDto } from './dto/create-payment-system.dto';
import { UpdatePaymentSystemDto } from './dto/update-payment-system.dto';
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
  }
}
