import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Res,
} from '@nestjs/common';

import { PhonepeService } from './phonepe/phonepe.service';
import { RazorpayService } from './razorpay/razorpay.service';
import { CreatePaymentOrderDto } from './dto/createPaymentOrder.dto';
import { Repository } from 'typeorm';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PayinService } from 'src/payin/payin.service';
import { Response } from 'express';
import { PaymentSystemUtilService } from './payment-system.util.service';
import {
  GatewayName,
  OrderStatus,
  OrderType,
  PaymentMadeOn,
  PaymentType,
} from 'src/utils/enum/enum';
import { ChannelSettings } from 'src/gateway/entities/channel-settings.entity';
import { GetPayPageDto } from './dto/getPayPage.dto';
import { SystemConfig } from 'src/system-config/entities/system-config.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { UniqpayService } from './uniqpay/uniqpay.service';
import { Payin } from 'src/payin/entities/payin.entity';
import { MemberChannelService } from './member/member-channel.service';

// const paymentPageBaseUrl = 'http://localhost:5174';
@Injectable()
export class PaymentSystemService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,

    @InjectRepository(Payin)
    private readonly payinRepository: Repository<Payin>,

    private readonly phonepeService: PhonepeService,
    private readonly razorpayService: RazorpayService,
    private readonly uniqpayService: UniqpayService,
    private readonly payinService: PayinService,
    private readonly utilService: PaymentSystemUtilService,
    private readonly systemConfigService: SystemConfigService,
    private readonly memberChannelService: MemberChannelService,
  ) {}

  async getPayPage(getPayPageDto: GetPayPageDto) {
    await this.utilService.getPayPage(getPayPageDto);
  }

  async getOrderDetails(orderId: string) {
    return await this.razorpayService.getPaymentStatus(orderId);
  }

  async createPaymentOrder(createPaymentOrderDto: CreatePaymentOrderDto) {
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

    this.utilService.assignPaymentMethodForPayinOrder(
      merchant,
      createdPayin,
      createPaymentOrderDto.userId,
    );

    return {
      orderId: createdPayin.systemOrderId,
    };
  }

  async makeGatewayPayout(body): Promise<any> {
    const { userId, orderId, amount, orderType } = body;

    if (!orderType) throw new BadRequestException('Order Type Required!');

    const { defaultPayoutGateway, defaultWithdrawalGateway } =
      await this.systemConfigService.findLatest();

    let defaultEnabledGateway;
    if (orderType === OrderType.WITHDRAWAL)
      defaultEnabledGateway = await this.utilService.getFirstEnabledGateway(
        defaultWithdrawalGateway,
      );

    if (orderType === OrderType.PAYOUT)
      defaultEnabledGateway =
        await this.utilService.getFirstEnabledGateway(defaultPayoutGateway);

    return await this.processPaymentWithGateway(defaultEnabledGateway, body);
  }

  private async processPaymentWithGateway(gatewayName: GatewayName, body: any) {
    switch (gatewayName) {
      case GatewayName.PHONEPE:
        return await this.phonepeService.makePayoutPayment(body);
      case GatewayName.RAZORPAY:
        return await this.razorpayService.makePayoutPayment(body);
      case GatewayName.UNIQPAY:
        return await this.uniqpayService.makePayoutPayment(body);
      default:
        throw new BadRequestException('Unsupported gateway!');
    }
  }

  async getPaymentStatus(payinOrderId: string) {
    const payinOrder = await this.payinRepository.findOneBy({
      systemOrderId: payinOrderId,
    });
    if (!payinOrder) throw new NotFoundException('payin system ID invalid!');

    const paymentMethod = payinOrder.payinMadeOn;

    let res = null;
    if (paymentMethod === PaymentMadeOn.MEMBER)
      res = await this.memberChannelService.getPaymentStatus(payinOrder);

    if (payinOrder.gatewayName === GatewayName.RAZORPAY)
      res = await this.razorpayService.getPaymentStatus(payinOrder.trackingId);

    if (payinOrder.gatewayName === GatewayName.PHONEPE)
      res = await this.phonepeService.getPaymentStatus(
        payinOrder.trackingId,
        '',
      );

    if (res && (res.status === 'SUCCESS' || res.status === 'FAILED')) {
      await this.payinService.updatePayinStatusToSubmitted({
        id: payinOrderId,
        transactionReceipt: res.details?.transactionReceipt || 'receipt',
        transactionId: res.details?.transactionId || 'trnx001',
        transactionDetails: res.details?.otherPaymentDetails,
      });

      if (res.status === 'SUCCESS')
        await this.payinService.updatePayinStatusToComplete({
          id: payinOrderId,
        });

      if (res.status === 'FAILED')
        await this.payinService.updatePayinStatusToFailed({
          id: payinOrder,
        });
    }

    if (res) return { status: res.status };

    throw new NotFoundException('Unable to find status!');
  }

  async getOrderDetailsForIntegrationKit(id: string) {
    if (!id) return;

    const payin = await this.payinRepository.findOne({
      where: { systemOrderId: id },
      relations: ['user'],
    });
    if (!payin) throw new NotFoundException('Payin order not found!');

    return {
      kingsgateOrderId: payin.systemOrderId,
      orderId: payin.merchantOrderId,
      status: payin.status === OrderStatus.COMPLETE ? 'SUCCESS' : 'FAILED',
      user: {
        id: payin.user?.userId,
        name: payin.user?.name,
        mobile: payin.user?.mobile,
        email: payin.user?.email,
      },
      transactionDetails: {
        id: payin.transactionId,
        amount: payin.amount,
        paymentMethod: payin.channel,
        time: payin.updatedAt,
      },
    };
  }

  async receivePhonepeRequest(request, body) {
    const res = await this.phonepeService.receivePhonepeRequest(request, body);

    if (
      res &&
      (res?.code === 'PAYMENT_SUCCESS' || res?.code === 'PAYMENT_FAILED')
    ) {
      const payinOrder = await this.payinRepository.findOneBy({
        systemOrderId: res?.data?.merchantTransactionId,
      });
      if (!payinOrder) throw new NotFoundException('Payin order not found!');

      await this.payinService.updatePayinStatusToSubmitted({
        id: payinOrder.id,
        transactionReceipt: 'receipt',
        transactionId: res?.data?.transactionId || 'trnx001',
        transactionDetails: res?.data,
      });

      if (res.code === 'PAYMENT_SUCCESS')
        await this.payinService.updatePayinStatusToComplete({
          id: payinOrder.id,
        });

      if (res.code === 'PAYMENT_FAILED')
        await this.payinService.updatePayinStatusToFailed({
          id: payinOrder.id,
        });
    }
  }
}
