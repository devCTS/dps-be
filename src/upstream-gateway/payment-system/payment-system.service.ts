import { Injectable } from '@nestjs/common';
import { RazorpayService } from '../razorpay/razorpay.service';
import { PhonepeService } from '../phonepe/phonepe.service';

@Injectable()
export class PaymentSystemService {
  constructor(
    private razorpayService: RazorpayService,
    private phonepeService: PhonepeService,
  ) {}

  getPhonepePayments(paymentMethod) {
    return this.phonepeService.phonepePayement(paymentMethod);
  }

  getRazorpayPayments() {
    return this.razorpayService.razorpayPayment();
  }

  getRazorpayPayouts() {
    return this.razorpayService.razorpayPayout();
  }
}
