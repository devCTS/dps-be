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
import { PaymentMadeOn, PaymentType } from 'src/utils/enum/enum';
import { ChannelSettings } from 'src/gateway/entities/channel-settings.entity';

@Injectable()
export class PaymentSystemService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(ChannelSettings)
    private readonly channelSettingsRepository: Repository<ChannelSettings>,
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

    let selectedPaymentMode;

    switch (merchant.payinMode) {
      case 'DEFAULT':
        selectedPaymentMode = await this.utilService.fetchForDefault(
          merchant,
          createdPayin.channel,
        );
        break;

      case 'AMOUNT RANGE':
        selectedPaymentMode = await this.utilService.fetchForAmountRange(
          merchant,
          createdPayin.channel,
          createdPayin.amount,
        );
        break;

      case 'PROPORTIONAL':
        selectedPaymentMode = await this.utilService.fetchForProportional(
          merchant,
          createdPayin.channel,
        );
        break;

      default:
        break;
    }

    const isMember = selectedPaymentMode?.id ? true : false;
    let paymentDetails;
    const channelKey = createdPayin.channel;

    if (isMember) {
      paymentDetails = selectedPaymentMode.identity[channelKey];
    } else {
      paymentDetails = await this.channelSettingsRepository.findOne({
        where: {
          gatewayName: selectedPaymentMode,
          type: PaymentType.INCOMING,
          channelName: channelKey,
        },
      });
    }

    const body = {
      id: createdPayin.systemOrderId,
      paymentMode: isMember ? PaymentMadeOn.MEMBER : PaymentMadeOn.GATEWAY,
      memberId: isMember && selectedPaymentMode.id,
      gatewayServiceRate: !isMember ? paymentDetails.upstreamFee : null,
      memberPaymentDetails: isMember ? paymentDetails[0] : null,
      gatewayName: !isMember ? selectedPaymentMode : null,
    };
    await this.payinService.updatePayinStatusToAssigned(body);

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
