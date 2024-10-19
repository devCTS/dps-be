import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentSystemService } from './payment-system.service';
import { CreatePaymentSystemDto } from './dto/create-payment-system.dto';
import { UpdatePaymentSystemDto } from './dto/update-payment-system.dto';
import { PhonepeService } from './phonepe/phonepe.service';

@Controller('payment-system')
export class PaymentSystemController {
  constructor(private readonly service: PaymentSystemService) {}

  @Get('checkout/:integrationId')
  getCheckout(@Param('integrationId') integrationId: string) {
    // fetch merchant by Integration Id
    if (false)
      throw new BadRequestException(
        'Integration Error. Merchant profile not found.',
      );
    if (false)
      throw new BadRequestException(
        'Integration Error. Merchant profile is disabled.',
      );
    if (false)
      throw new UnauthorizedException(
        'Authorisation Error. Business Url validation failed.',
      );

    // there should be one enabled channel for this merchant
    if (false)
      throw new NotFoundException(
        'No Payin Channels Found. Merchant does not have any enabled payin channels.',
      );
    return {
      channels: ['upi', 'netbanking', 'e-wallet'],
    };
  }

  @Post('create-payment')
  createPaymentOrder(@Body() body: any) {
    // called at the time of selecting a channel
    // also starts looking up for gateway or member channel - whole payment page section
  }

  @Get()
  getPhonepePayPage(@Body() body: { userId: string; amount: string }) {
    return this.service.getPayPage(body.userId, body.amount);
  }
}
