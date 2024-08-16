import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PaymentSystemService } from './payment-system.service';

@Controller('payment-system')
export class PaymentSystemController {
  constructor(private paymentSystemService: PaymentSystemService) {}
}
