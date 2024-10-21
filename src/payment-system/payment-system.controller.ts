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
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { PaymentSystemService } from './payment-system.service';
import * as QRCode from 'qrcode';
import { PhonepeService } from './phonepe/phonepe.service';
import { CreatePaymentOrderDto } from './dto/createPaymentOrder.dto';
import { SubmitPaymentOrderDto } from './dto/submitPayment.dto';

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
      // channels: ['upi', 'netbanking', 'e-wallet'],
      businessName: 'AJAX Gaming Pvt. Ltd.',
      channels: ['upi', 'netbanking'],
    };
  }

  @Post('create-payment-order')
  createPaymentOrder(@Body() createPaymentOrderDto: CreatePaymentOrderDto) {
    // called at the time of selecting a channel
    // also starts looking up for gateway or member channel - whole payment page section
    // create payin
    // select gateway or channel

    return {
      url: 'http://localhost:5173/payment/1234',
      orderId: '1234',
    };
  }

  @Get('member-channel/:payinOrderId')
  async getMemberChannelPage(@Param('payinOrderId') payinOrderId: string) {
    const upiId = '9149965887@ybl';
    const name = 'Paarth Manhas';
    const amount = '235';
    const upiIntentURI = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;

    if (true)
      return {
        channel: 'upi',
        amount: amount,
        memberDetails: {
          upiId: upiId,
          isBusiness: true,
          name: name,
          qrCode: await QRCode.toDataURL(upiIntentURI),
        },
      };

    if (false)
      return {
        channel: 'netbanking',
        amount: amount,
        memberDetails: {
          beneficiaryName: 'Paarth Manhas',
          name: name,
          accountNumber: 'JAKA022345985695895665',
          ifsc: 'JAKAOLABAZAR',
          bank: 'J&K Bank',
        },
      };

    if (false)
      return {
        channel: 'e-wallet',
        amount: amount,
        memberDetails: {
          appName: 'MobiQwik',
          name: name,
          mobile: '919199191991',
        },
      };
  }

  @Get('status/:payinOrderId')
  getPaymentStatus(@Param('payinOrderId') payinOrderId: string) {
    // return { status: 'PENDING' };
    // return { status: 'PENDING' }
    return { status: 'FAILED' };
  }

  @Post('submit-payment/:payinOrderId')
  submitPayment(
    @Param('payinOrderId') payinOrderId: string,
    @Body() submitPaymentOrderDto: SubmitPaymentOrderDto,
  ) {
    return HttpStatus.OK;
  }

  @Get()
  getPayPage(@Body() body: { userId: string; amount: string }) {
    return this.service.getPayPage(body.userId, body.amount);
  }

  @Post('razorpay/:orderId')
  getRazorPayOrderDetails(@Param('orderId') orderId: string) {
    return this.service.getOrderDetails(orderId);
  }
}
