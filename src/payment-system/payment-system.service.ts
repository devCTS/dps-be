import { Injectable, NotFoundException } from '@nestjs/common';

import { PhonepeService } from './phonepe/phonepe.service';
import { RazorpayService } from './razorpay/razorpay.service';
import { CreatePaymentOrderDto } from './dto/createPaymentOrder.dto';
import { Repository } from 'typeorm';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PayinService } from 'src/payin/payin.service';
import { Response } from 'express';
import { PaymentSystemUtilService } from './payment-system.util.service';
import { Member } from 'src/member/entities/member.entity';

@Injectable()
export class PaymentSystemService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    private readonly phonepeService: PhonepeService,
    private readonly razorpayService: RazorpayService,
    private readonly payinService: PayinService,
    private readonly utilService: PaymentSystemUtilService,
  ) {}

  async getPayPage(userId: string, amount: string) {
    // return await this.razorpayService.getPayPage();
    return await this.phonepeService.getPayPage(userId, amount);
  }

  async getOrderDetails(orderId: string) {
    return await this.razorpayService.razorpayPaymentStatus(orderId);
  }

  async createPaymentOrder(
    createPaymentOrderDto: CreatePaymentOrderDto,
    response: Response,
  ) {
    // 1. create payin order
    // 2. Check payin mode of merchant
    // if payin mode is default
    // 3.a. check if merchant has disabled member channels or gateways
    // 3.b. if member channels are disabled no timeout simply fetch payin gateway
    // 3.c. if gateways are disabled search for member channels without any timeout
    // d. if both are enabled, search for member channels within a timeout expires, fetch the gateway.
    // if payin mode is amount range
    // 4.a. fetch the associated gateway/member according to the amount, without any timeout.

    // if payin mode is proportional mode -
    // 5.a. (60 % + sum of ratios)
    // 6. After member/gateway selected update the payin order (assigned status with the details)
    const merchant = await this.merchantRepository.findOne({
      where: {
        integrationId: createPaymentOrderDto.integrationId,
      },
      relations: [
        'payinModeDetails',
        'payinModeDetails.proportionalRange',
        'payinModeDetails.amountRangeRange',
      ],
    });
    if (!merchant) throw new NotFoundException('Merchant not found!');

    const createdPayin = await this.payinService.create(createPaymentOrderDto);

    switch (merchant.payinMode) {
      case 'DEFAULT':
        await this.utilService.fetchForDefault(merchant, createdPayin.channel);
        break;

      case 'AMOUNT RANGE':
        await this.utilService.fetchForAmountRange(merchant);
        break;

      case 'PROPORTIONAL':
        await this.utilService.fetchForProportional(merchant);
        break;

      default:
        break;
    }

    await this.payinService.updatePayinStatusToAssigned({});

    return {
      url: `http://localhost:5173/payment/${createdPayin.systemOrderId}`,
      orderId: createdPayin.systemOrderId,
    };
  }

  async phonepeCheckStatus(
    res: Response,
    transactionId: string,
    userId: string,
  ) {
    return await this.phonepeService.checkStatus(res, transactionId, userId);
  }

  async paymentVerification(paymentData: any) {
    return await this.razorpayService.getRazorpayPayementStatus(paymentData);
  }
}
