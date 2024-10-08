import { HttpService } from '@nestjs/axios';
import { ConflictException, Injectable } from '@nestjs/common';
//@ts-ignore
import * as Razorpay from 'razorpay';

@Injectable()
export class RazorpayService {
  razorpayClient: any = null;
  public constructor(private readonly httpService: HttpService) {
    this.razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  //   razorpay payment
  async getPayPage(userId: string = 'U111', amount: string = '1') {
    // transaction amount
    const amountInPaise = parseFloat(amount) * 100;
    const options = {
      amount: amountInPaise,
      customer: {
        name: 'Kartik Sahrma',
        email: 'kartik.sharma@catalyst.sh',
        contact: '9816127247',
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
    };
  }
}
