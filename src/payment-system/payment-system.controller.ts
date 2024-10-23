import { AmountRangePayinMode } from './../merchant/entities/amountRangePayinMode.entity';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
  NotFoundException,
  HttpStatus,
  Req,
  UnauthorizedException,
  Res,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PaymentSystemService } from './payment-system.service';
import * as QRCode from 'qrcode';
import { CreatePaymentOrderDto } from './dto/createPaymentOrder.dto';
import { SubmitPaymentOrderDto } from './dto/submitPayment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Repository } from 'typeorm';
import { PayinService } from 'src/payin/payin.service';
import { Payin } from 'src/payin/entities/payin.entity';
import { ChannelName, OrderStatus } from 'src/utils/enum/enum';
import { Config } from 'src/channel/entity/config.entity';

@Controller('payment-system')
export class PaymentSystemController {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Payin)
    private readonly payinRepository: Repository<Payin>,
    @InjectRepository(Config)
    private readonly configRepository: Repository<Config>,
    private readonly service: PaymentSystemService,
    private readonly payinService: PayinService,
  ) {}

  @Get('check-status/:transactionId/:userId')
  checkStatus(
    @Req() req: Request,
    @Res() res,
    @Param('transactionId') transactionId: string,
    @Param('userId') userId: string,
  ) {
    return this.service.phonepeCheckStatus(res, transactionId, userId);
  }

  @Post('checkout/:integrationId')
  async getCheckout(
    @Param('integrationId') integrationId: string,
    @Body() body: { requestOrigin: string },
  ) {
    const merchant = await this.merchantRepository.findOneBy({ integrationId });
    const { requestOrigin } = body;

    if (!merchant)
      throw new NotFoundException(
        'Merchant not found or invalid integration ID!',
      );

    if (!merchant.enabled)
      throw new BadRequestException(
        'Integration Error. Merchant profile is disabled.',
      );

    if (merchant.businessUrl && !requestOrigin.includes(merchant.businessUrl))
      throw new UnauthorizedException(
        'Authorization Error. Business Url validation failed.',
      );

    // if (merchant.payinChannels) {
    //   const channels = JSON.parse(merchant.payinChannels);

    //   const enabledChannels = await Promise.all(
    //     channels.map((channel) =>
    //       this.configRepository.findBy({ incoming: true, name: channel }),
    //     ),
    //   );

    //   if (enabledChannels.length <= 0)
    //     throw new BadRequestException('All channels are disabled!');
    // }

    return {
      businessName: merchant.businessName,
      channels: ['upi', 'netbanking'],
      // channels: JSON.parse(merchant.payinChannels),
    };
  }

  @Post('create-payment-order')
  async createPaymentOrder(
    @Body() createPaymentOrderDto: CreatePaymentOrderDto,
    @Res() response: Response,
  ) {
    return this.service.createPaymentOrder(createPaymentOrderDto, response);
  }

  @Get('member-channel/:payinOrderId')
  async getMemberChannelPage(@Param('payinOrderId') payinOrderId: string) {
    const payin = await this.payinRepository.findOne({
      where: { systemOrderId: payinOrderId },
      relations: [
        'member',
        'member.identity',
        'member.identity.upi',
        'member.identity.netBanking',
        'member.identity.eWallet',
      ],
    });
    if (!payin) throw new NotFoundException('Payin order not found!');

    const name = payin.member.firstName + ' ' + payin.member.lastName;
    const amount = payin.amount;

    switch (payin.channel) {
      case ChannelName.UPI:
        const upiDetails = payin.member.identity.upi[0];
        const upiIntentURI = `upi://pay?pa=${upiDetails.upiId}&pn=${name}&am=${amount}&cu=INR`;

        return {
          channel: 'upi',
          amount: amount,
          memberDetails: {
            upiId: upiDetails.upiId,
            isBusiness: true,
            name: name,
            qrCode: await QRCode.toDataURL(upiIntentURI),
          },
        };

      case ChannelName.BANKING:
        const netBankingDetails = payin.member.identity.netBanking[0];

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
        const eWalletDetails = payin.member.identity.eWallet[0];

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

  @Get('status/:payinOrderId')
  async getPaymentStatus(@Param('payinOrderId') payinOrderId: string) {
    const payinOrder = await this.payinRepository.findOneBy({
      systemOrderId: payinOrderId,
    });
    if (!payinOrder) throw new NotFoundException('payin system ID invalid!');

    let status = 'PENDING';

    if (payinOrder.status === OrderStatus.COMPLETE)
      status = OrderStatus.COMPLETE;

    if (payinOrder.status === OrderStatus.FAILED) status = OrderStatus.FAILED;

    return { status };
  }

  @Post('submit-payment/:payinOrderId')
  async submitPayment(
    @Param('payinOrderId') payinOrderId: string,
    @Body() submitPaymentOrderDto: SubmitPaymentOrderDto,
  ) {
    await this.payinService.updatePayinStatusToSubmitted({
      transactionId: submitPaymentOrderDto.txnId,
      transactionReceipt: submitPaymentOrderDto.receipt,
      id: payinOrderId,
    });
    return HttpStatus.OK;
  }

  @Post()
  getPayPage(@Body() body: { userId: string; amount: string }) {
    return this.service.getPayPage(body.userId, body.amount);
  }

  @Post('razorpay/:orderId')
  getRazorPayOrderDetails(@Param('orderId') orderId: string) {
    return this.service.getOrderDetails(orderId);
  }
}
