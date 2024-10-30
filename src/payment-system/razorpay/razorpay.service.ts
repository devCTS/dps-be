import { HttpService } from '@nestjs/axios';
import { ConflictException, Injectable } from '@nestjs/common';
//@ts-ignore
import * as Razorpay from 'razorpay';
import { GetPayPageDto } from '../dto/getPayPage.dto';
import { get } from 'http';
import { InjectRepository } from '@nestjs/typeorm';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { Repository } from 'typeorm';

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
    const { userId, amount } = getPayPageDto;

    const endUser = await this.endUserRepository.findOneBy({ userId });

    // transaction amount
    const amountInPaise = parseFloat(amount) * 100;
    const options = {
      amount: amountInPaise,
      customer: {
        name: endUser.name,
        email: endUser.email,
        contact: endUser.mobile,
      },
      currency: 'INR',
      options: {
        checkout: {
          method: {
            netbanking: true,
            upi: true,
            card: true,
            wallet: true,
          },
        },
      },
      // upi_link: true, // Prod only
    };

    const payment = await this.razorpayClient.paymentLink.create(options);

    return {
      url: payment.short_url,
      details: payment,
    };
  }

  async makePayoutPayment({ userId, amount = 1000, orderId }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
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

  async razorpayPaymentStatus(paymentLinkId: string) {
    const paymentLinkDetails =
      await this.razorpayClient.paymentLink.fetch(paymentLinkId);

    return await this.razorpayClient.orders.fetchPayments(
      paymentLinkDetails?.order_id,
    );
  }

  getRazorpayPayementStatus(paymentData) {
    let paymentStatus = 'pending';

    const failed = 'payment.failed';
    const paid = 'payment_link.paid';
    const expired = 'payment_link.expired';

    if (paymentData.event === failed || paymentData.event === expired) {
      paymentStatus = 'failed';
    }

    if (paymentData.event === paid) {
      paymentStatus = 'success';
    }

    return paymentStatus;
  }
}
