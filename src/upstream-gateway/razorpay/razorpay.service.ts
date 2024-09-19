import { Injectable } from '@nestjs/common';
import { InjectRazorpay } from 'nestjs-razorpay';
//@ts-ignore
import * as Razorpay from 'razorpay';
import { generateSHA256 } from '../payment-system/payment-system.utils';
import { PaymentDetailsDto, RequestPaymentDto } from './dto/razorpay.dto';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class RazorpayService {
  public constructor(
    @InjectRazorpay() private readonly razorpayClient: Razorpay,
    private readonly httpService: HttpService,
  ) {}

  //   razorpay payment
  async razorpayPayment(requestPayment?: RequestPaymentDto) {
    const options = {
      amount: 100,
      customer: {
        name: 'Kartik Sahrma',
        email: 'kartik.sharma@catalyst.sh',
        contact: '9816127247',
      },
      currency: 'INR',
      options: {
        checkout: {
          method: {
            netbanking: false,
            upi: false,
            card: false,
            wallet: true,
          },
        },
      },
      // upi_link: true, // Prod only
    };

    const payment = await this.razorpayClient.paymentLink.create(options);

    return {
      payment,
    };
  }

  async razorpayPayout() {
    const options = {
      account_number: '7878780080857996',
      contact: {
        name: 'Gaurav Kumar',
        contact: '912345678',
        email: 'gaurav.kumar@example.com',
        type: 'customer',
      },
      amount: 1000,
      currency: 'INR',
      purpose: 'refund',
      description: 'Payout link for Gaurav Kumar',
      receipt: 'Receipt No. 1',
      send_sms: true,
      send_email: true,
      notes: {
        notes_key_1: 'Tea, Earl Grey, Hot',
        notes_key_2: 'Tea, Earl Grey… decaf.',
      },
      expire_by: 154538405,
    };

    const response = await this.httpService
      .post('https://api.razorpay.com/v1/payout-links', options)
      .toPromise();

    return response;
  }

  // payment verification
  async razorpayPaymentVerification(paymentDetails: PaymentDetailsDto) {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      paymentDetails;
    const paymentIds = razorpay_order_id + '|' + razorpay_payment_id;
    if (generateSHA256(paymentIds) === razorpay_signature) {
      return true;
    } else {
      return 'invalid payment details';
    }
  }

  async razorpayPaymentStatus(order_id: string) {
    return await this.razorpayClient.orders.fetchPayments(order_id);
  }
}
