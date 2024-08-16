import { Injectable } from '@nestjs/common';
import { RazorpayService } from '../razorpay/razorpay.service';
import { PhonepeService } from '../phonepe/phonepe.service';

@Injectable()
export class PaymentSystemService {
  constructor(
    private razorpayService: RazorpayService,
    private phonepeService: PhonepeService,
  ) {}

  returnVal(a: string) {
    return this.razorpayService.razorpayPaymentStatus(a);
  }
}
