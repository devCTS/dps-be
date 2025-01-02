import {
  BadRequestException,
  Injectable,
  NotFoundException,
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
  OrderType,
  PaymentMadeOn,
  PaymentType,
} from 'src/utils/enum/enum';
import { ChannelSettings } from 'src/gateway/entities/channel-settings.entity';
import { GetPayPageDto } from './dto/getPayPage.dto';
import { SystemConfig } from 'src/system-config/entities/system-config.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { UniqpayService } from './uniqpay/uniqpay.service';

// const paymentPageBaseUrl = 'http://localhost:5174';
@Injectable()
export class PaymentSystemService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(ChannelSettings)
    private readonly channelSettingsRepository: Repository<ChannelSettings>,
    private readonly phonepeService: PhonepeService,
    private readonly razorpayService: RazorpayService,
    private readonly uniqpayService: UniqpayService,
    private readonly payinService: PayinService,
    private readonly utilService: PaymentSystemUtilService,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async getPayPage(getPayPageDto: GetPayPageDto) {
    const { gateway } = getPayPageDto;

    if (gateway === GatewayName.PHONEPE)
      return await this.phonepeService.getPayPage(getPayPageDto);

    if (gateway === GatewayName.RAZORPAY)
      return await this.razorpayService.getPayPage(getPayPageDto);
  }

  async getOrderDetails(orderId: string) {
    return await this.razorpayService.razorpayPaymentStatus(orderId);
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

    let channelNameMap = {
      UPI: 'upi',
      NET_BANKING: 'netBanking',
      E_WALLET: 'eWallet',
    };
    let channelName = channelNameMap[createdPayin.channel];

    this.utilService.handleAssignMemberPage(
      createdPayin?.systemOrderId,
      channelName,
      createdPayin?.amount,
      createPaymentOrderDto.userId,
    );
    return { orderId: createdPayin.systemOrderId };

    // switch (merchant.payinMode) {
    //   case 'DEFAULT':
    //     selectedPaymentMode = await this.utilService.fetchForDefault(
    //       merchant,
    //       channelName,
    //       createdPayin.amount,
    //     );
    //     break;

    //   case 'AMOUNT RANGE':
    //     selectedPaymentMode = await this.utilService.fetchForAmountRange(
    //       merchant,
    //       channelName,
    //       createdPayin.amount,
    //     );
    //     break;

    //   case 'PROPORTIONAL':
    //     selectedPaymentMode = await this.utilService.fetchForProportional(
    //       merchant,
    //       channelName,
    //       createdPayin.amount,
    //     );
    //     break;

    //   default:
    //     break;
    // }

    /////////////////previous logic///////////////////////
    // let selectedPaymentMode;
    // let  paymentDetails = selectedPaymentMode.identity[channelName];

    // selectedPaymentMode = await this.utilService.fetchForDefault(
    //   merchant,
    //   channelName,
    //   createdPayin.amount,
    // );

    // const isMember = !!selectedPaymentMode?.id;
    // let paymentDetails;

    // if (isMember) {
    //   paymentDetails = selectedPaymentMode.identity[channelName];
    // } else {
    //   paymentDetails = await this.channelSettingsRepository.findOne({
    //     where: {
    //       gatewayName: selectedPaymentMode,
    //       type: PaymentType.INCOMING,
    //       channelName: createdPayin.channel,
    //     },
    //   });
    // }

    // const body = {
    //   id: createdPayin.systemOrderId,
    //   paymentMode: isMember ? PaymentMadeOn.MEMBER : PaymentMadeOn.GATEWAY,
    //   memberId: isMember && selectedPaymentMode.id,
    //   gatewayServiceRate: !isMember ? paymentDetails.upstreamFee : null,
    //   memberPaymentDetails: isMember ? paymentDetails[0] : null,
    //   gatewayName: !isMember ? selectedPaymentMode : null,
    //   userId: createPaymentOrderDto.userId,
    // };

    // await this.payinService.updatePayinStatusToAssigned(body);

    // let url = '';
    // if (isMember)
    //   url = `${process.env.PAYMENT_PAGE_BASE_URL}/payment/${createdPayin.systemOrderId}`;

    // if (selectedPaymentMode === GatewayName.PHONEPE) {
    //   const res = await this.getPayPage({
    //     userId: createdPayin.user?.userId,
    //     amount: createdPayin.amount.toString(),
    //     orderId: createdPayin.systemOrderId,
    //     gateway: GatewayName.PHONEPE,
    //   });
    //   url = res.url;
    // }

    // if (selectedPaymentMode === GatewayName.RAZORPAY) {
    //   const res = await this.getPayPage({
    //     userId: createdPayin.user?.userId,
    //     amount: createdPayin.amount.toString(),
    //     orderId: createdPayin.systemOrderId,
    //     gateway: GatewayName.RAZORPAY,
    //   });
    //   url = res.url;
    // }

    // response.send({
    //   url,
    //   orderId: createdPayin.systemOrderId,
    // });
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
}
