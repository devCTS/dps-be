import { Injectable } from '@nestjs/common';
import { RazorpayService } from '../razorpay/razorpay.service';
import { PhonepeService } from '../phonepe/phonepe.service';

@Injectable()
export class PaymentSystemService {
  constructor(
    private razorpayService: RazorpayService,
    private phonepeService: PhonepeService,
  ) {}

  getPhonepePayments() {
    return this.phonepeService.phonepePayement();
  }

  getRazorpayPayments() {
    return this.razorpayService.razorpayPayment();
  }
}
