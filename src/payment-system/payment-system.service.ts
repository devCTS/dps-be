import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotAcceptableException,
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
  ChannelName,
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
import { PayinSandbox } from 'src/payin/entities/payin-sandbox.entity';
import QRCode from 'qrcode';

// const paymentPageBaseUrl = 'http://localhost:5174';
@Injectable()
export class PaymentSystemService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Payin)
    private readonly payinRepository: Repository<Payin>,
    @InjectRepository(PayinSandbox)
    private readonly payinSandboxRepository: Repository<PayinSandbox>,

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

  async createPaymentOrder(createPaymentOrderDto: CreatePaymentOrderDto) {
    const { environment } = createPaymentOrderDto;

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

    let createdPayin;

    if (environment === 'live') {
      createdPayin = await this.payinService.create(createPaymentOrderDto);

      this.utilService.assignPaymentMethodForPayinOrder(
        merchant,
        createdPayin,
        createPaymentOrderDto.userId,
      );
    }

    if (environment === 'sandbox') {
      if (!createPaymentOrderDto.paymentMethod)
        throw new NotAcceptableException('Payment method missing!');

      createdPayin = await this.payinService.createAndAssignSandbox({
        ...createPaymentOrderDto,
        paymentMethod: createPaymentOrderDto.paymentMethod,
        merchantId: merchant.id,
      });

      this.utilService.processPaymentMethodSandbox(
        merchant,
        createdPayin,
        createPaymentOrderDto.paymentMethod,
        createPaymentOrderDto.userId,
        environment,
      );
    }

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
      // case GatewayName.PHONEPE:
      //   return await this.phonepeService.makePayoutPayment(body);
      case GatewayName.RAZORPAY:
        return await this.razorpayService.makePayoutPayment(body);
      // case GatewayName.UNIQPAY:
      //   return await this.uniqpayService.makePayoutPayment(body);
      default:
        throw new BadRequestException('Unsupported gateway!');
    }
  }

  async getPaymentStatus(
    payinOrderId: string,
    environment: 'live' | 'sandbox',
  ) {
    let payinOrder;

    if (environment === 'live')
      payinOrder = await this.payinRepository.findOneBy({
        systemOrderId: payinOrderId,
      });

    if (environment === 'sandbox')
      payinOrder = await this.payinSandboxRepository.findOneBy({
        systemOrderId: payinOrderId,
      });

    if (!payinOrder) return;

    const paymentMethod = payinOrder.payinMadeOn;

    let res = null;

    if (paymentMethod === PaymentMadeOn.MEMBER) {
      res = await this.memberChannelService.getPaymentStatus(payinOrder);
    } else {
      if (payinOrder.gatewayName === GatewayName.RAZORPAY) {
        if (!payinOrder || !payinOrder.trackingId) return;

        res = await this.razorpayService.getPaymentStatus(
          payinOrder.trackingId,
          environment,
        );

        if (!res?.status) return;
      }

      if (payinOrder.gatewayName === GatewayName.PHONEPE) {
        if (!payinOrder || !payinOrder.systemOrderId) return;

        res = await this.phonepeService.getPaymentStatus(
          payinOrder.systemOrderId,
          environment,
        );

        if (!res?.status) return;
      }

      if (res && (res.status === 'SUCCESS' || res.status === 'FAILED')) {
        if (environment === 'sandbox') {
          await this.payinSandboxRepository.update(
            { systemOrderId: payinOrderId },
            {
              transactionId: res.details?.transactionId || 'trnx001',
              transactionDetails: res.details?.otherPaymentDetails,
            },
          );

          if (res.status === 'SUCCESS')
            await this.payinSandboxRepository.update(
              { systemOrderId: payinOrderId },
              {
                status: OrderStatus.COMPLETE,
              },
            );

          if (res.status === 'FAILED')
            await this.payinSandboxRepository.update(
              { systemOrderId: payinOrderId },
              {
                status: OrderStatus.FAILED,
              },
            );
        }

        if (environment === 'live') {
          await this.payinService.updatePayinStatusToSubmitted({
            id: payinOrderId,
            transactionId: res.details?.transactionId || 'trnx001',
            transactionDetails: res.details?.otherPaymentDetails,
          });

          if (res.status === 'SUCCESS') {
            await this.payinService.updatePayinStatusToComplete({
              id: payinOrderId,
            });
          }

          if (res.status === 'FAILED') {
            await this.payinService.updatePayinStatusToFailed({
              id: payinOrderId,
            });
          }
        }
      }
    }

    if (res) return { status: res.status };

    throw new NotFoundException('Unable to find status!');
  }

  async getOrderDetailsForIntegrationKit(
    id: string,
    environment: 'sandbox' | 'live',
  ) {
    if (!id || !environment) return;

    let payin;

    if (environment === 'live')
      payin = await this.payinRepository.findOne({
        where: { systemOrderId: id },
        relations: ['user'],
      });

    if (environment === 'sandbox') {
      payin = await this.payinSandboxRepository.findOne({
        where: { systemOrderId: id },
      });
    }

    if (!payin) throw new NotFoundException('Payin order not found!');

    return {
      kingsgateOrderId: payin.systemOrderId,
      orderId: payin.merchantOrderId,
      status: payin.status === OrderStatus.FAILED ? 'FAILED' : 'SUCCESS',
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

  async receivePhonepeRequest(request, body, environment) {
    const res = await this.phonepeService.receivePhonepeRequest(
      request,
      body,
      environment,
    );

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

  async getMemberChannelPageForSandbox(payinOrderId) {
    const payin = await this.payinSandboxRepository.findOne({
      where: { systemOrderId: payinOrderId },
    });
    if (!payin) throw new NotFoundException('Payin order not found!');

    const name = payin.member.name;
    const amount = payin.amount;

    switch (payin.channel) {
      case ChannelName.UPI:
        const upiDetails = {
          upiId: 'karlpearson@upi',
          mobile: '9876543210',
          isBusinessUpi: true,
        };
        const upiIntentURI = `upi://pay?pa=${upiDetails.upiId}&pn=${name}&am=${amount}&cu=INR`;

        return {
          channel: 'upi',
          amount: amount,
          memberDetails: {
            upiId: upiDetails.upiId,
            isBusiness: upiDetails.isBusinessUpi,
            name: name,
            qrCode: await QRCode.toDataURL(upiIntentURI),
          },
        };

      case ChannelName.BANKING:
        const netBankingDetails = {
          beneficiaryName: 'Karl Pearson',
          name: name,
          accountNumber: '1234 1234 1234 1234',
          ifsc: 'SBI002900',
          bankName: 'SBI',
        };

        return {
          channel: 'netbanking',
          amount: amount,
          memberDetails: {
            beneficiaryName: netBankingDetails.beneficiaryName,
            name: name,
            accountNumber: netBankingDetails.accountNumber,
            ifsc: netBankingDetails.ifsc,
            bank: netBankingDetails.bankName,
          },
        };

      case ChannelName.E_WALLET:
        const eWalletDetails = {
          app: 'Dummy App',
          name: name,
          mobile: '9876543210',
        };

        return {
          channel: 'e-wallet',
          amount: amount,
          memberDetails: {
            appName: eWalletDetails.app,
            name: name,
            mobile: eWalletDetails.mobile,
          },
        };
    }
  }
}
