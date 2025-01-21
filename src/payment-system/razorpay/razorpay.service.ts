import { HttpService } from '@nestjs/axios';
import { ConflictException, Injectable } from '@nestjs/common';
//@ts-ignore
import Razorpay from 'razorpay';
import { GetPayPageDto } from '../dto/getPayPage.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { Repository } from 'typeorm';
import { ChannelName } from 'src/utils/enum/enum';

@Injectable()
export class RazorpayService {
  razorpayClient: any = null;
  public constructor(
    @InjectRepository(EndUser)
    private readonly endUserRepository: Repository<EndUser>,

    private readonly httpService: HttpService,
  ) {
    this.razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  //   razorpay payment
  async getPayPage(getPayPageDto: GetPayPageDto) {
    const { userId, amount, orderId, integrationId, channelName } =
      getPayPageDto;

    const endUser = await this.endUserRepository.findOneBy({ userId });

    // transaction amount
    const amountInPaise = parseFloat(amount) * 100;
    const options = {
      amount: amountInPaise,
      customer: {
        name: endUser?.name || '',
        email: endUser?.email || '',
        contact: endUser?.mobile || '',
      },
      currency: 'INR',
      options: {
        checkout: {
          method: {
            netbanking: channelName === ChannelName.BANKING ? true : false,
            upi: channelName === ChannelName.UPI ? true : false,
            wallet: channelName === ChannelName.E_WALLET ? true : false,
            card: false,
          },
        },
      },
      callback_url: `${process.env.PAYMENT_PAGE_BASE_URL}/checkout/${integrationId}?callback=true&orderId=${orderId}`,
      callback_method: 'get',
    };

    const paymentLink = await this.razorpayClient.paymentLink.create(options);

    return {
      url: paymentLink.short_url,
      details: paymentLink,
      trackingId: paymentLink.id,
    };
  }

  async makePayoutPayment({ userId, amount = 1000, orderId }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          gatewayName: 'RAZORPAY',
          transactionId: 'TRXN123-ABC-156',
          transactionReceipt: 'https://www.google.com',
          paymentStatus: 'success',
          transactionDetails: {
            date: new Date(),
            amount: amount,
          },
        });
      }, 3000);
    });
  }

  async getPaymentStatus(paymentLinkId: string) {
    const paymentLinkDetails =
      await this.razorpayClient.paymentLink.fetch(paymentLinkId);

    const orderResponse = await this.razorpayClient.orders.fetchPayments(
      paymentLinkDetails?.order_id,
    );

    const orderDetails = orderResponse?.items[0];

    let status;
    if (orderDetails.status === 'captured') status = 'SUCCESS';
    if (orderDetails.status === 'failed') status = 'FAILED';

    return {
      status,
      details: {
        transactionId: paymentLinkDetails?.payments[0]?.payment_id,
        transactionReceipt: orderDetails?.receipt,
        otherPaymentDetails: orderDetails,
      },
    };
  }

  // getRazorpayPayementStatus(paymentData) {
  //   let paymentStatus = 'pending';

  //   const failed = 'payment.failed';
  //   const paid = 'payment_link.paid';
  //   const expired = 'payment_link.expired';

  //   if (paymentData.event === failed || paymentData.event === expired) {
  //     paymentStatus = 'failed';
  //   }

  //   if (paymentData.event === paid) {
  //     paymentStatus = 'success';
  //   }

  //   return paymentStatus;
  // }
}
