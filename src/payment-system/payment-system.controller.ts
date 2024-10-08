import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PaymentSystemService } from './payment-system.service';
import { CreatePaymentSystemDto } from './dto/create-payment-system.dto';
import { UpdatePaymentSystemDto } from './dto/update-payment-system.dto';
import { PhonepeService } from './phonepe/phonepe.service';

@Controller('payment-system')
export class PaymentSystemController {
  constructor(private readonly service: PaymentSystemService) {}

  @Get()
  getPhonepePayPage(@Body() body: { userId: string; amount: string }) {
    return this.service.getPayPage(body.userId, body.amount);
  }
}
