import {
  BadRequestException,
  ConflictException,
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

  async phonepeCheckStatus(
    res: Response,
    transactionId: string,
    userId: string,
  ) {
    return await this.phonepeService.getPaymentStatus(
      res,
      transactionId,
      userId,
    );
  }

  // async paymentVerification(paymentData: any) {
  //   return await this.razorpayService.getRazorpayPayementStatus(paymentData);
  // }

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

    if (payinOrder.status !== OrderStatus.ASSIGNED)
      throw new ConflictException('Not Applicable for other statuses!');

    const paymentMethod = payinOrder.payinMadeOn;

    let res = null;
    if (paymentMethod === PaymentMadeOn.MEMBER) {
      res = await this.memberChannelService.getPaymentStatus(payinOrder);
    }

    if (payinOrder.gatewayName === GatewayName.RAZORPAY) {
      // set gateway response details in entity
      res = await this.razorpayService.getPaymentStatus(payinOrder.trackingId);

      if (res && res.status) {
        await this.payinService.updatePayinStatusToSubmitted({
          id: payinOrderId,
          transactionReceipt: res.details?.transactionReceipt || 'receipt', // TODO
          transactionId: res.details?.transactionId || 'trnx001',
        });

        if (res.status === 'SUCCESS')
          await this.payinService.updatePayinStatusToComplete({
            id: payinOrderId,
          });

        if (res.status === 'FAILED')
          await this.payinService.updatePayinStatusToFailed({ id: payinOrder });
      }
    }

    if (payinOrder.gatewayName === GatewayName.PHONEPE) {
      // set gateway response details in entity
      res = await this.phonepeService.getPaymentStatus(null, '', '');
    }

    if (res) return { status: res.status };

    throw new NotFoundException('Unable to find status!');
  }
}
