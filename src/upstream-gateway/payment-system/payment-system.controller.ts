import { Controller, Get } from '@nestjs/common';
import { PaymentSystemService } from './payment-system.service';

@Controller('payment-system')
export class PaymentSystemController {
  count: number;

  constructor(private paymentSystemService: PaymentSystemService) {}
  // Available Options - PAY_PAGE, NET_BANKING, CARD, UPI_INTENT, UPI_QR, UPI_VPA
  paymentMethod = 'PAY_PAGE';

  @Get('/phonepay')
  paymentPhonePay() {
    return this.paymentSystemService.getPhonepePayments(this.paymentMethod);
  }

  @Get('/razorpay')
  paymentRazorPay() {
    return this.paymentSystemService.getRazorpayPayments();
  }

  @Get('/razorpay/payout')
  payoutsRazorPay() {
    return this.paymentSystemService.getRazorpayPayouts();
  }
}
