import { Controller, Get } from '@nestjs/common';
import { PaymentSystemService } from './payment-system.service';

@Controller('payment-system')
export class PaymentSystemController {
  count: number;

  constructor(private paymentSystemService: PaymentSystemService) {}
  // Available Options - PAY_PAGE, NET_BANKING, CARD, UPI_INTENT, UPI_QR, UPI_VPA
  paymentMethod = 'PAY_PAGE';

  // TODO: Currently uset get request and dummy data for testing on browser. Will be changed after
  @Get()
  payment() {
    return this.paymentSystemService.getPhonepePayments(this.paymentMethod);
  }
}
