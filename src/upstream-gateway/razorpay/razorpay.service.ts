import { Injectable } from '@nestjs/common';
import { InjectRazorpay } from 'nestjs-razorpay';
//@ts-ignore
import * as Razorpay from 'razorpay';
import { generateSHA256 } from '../payment-system/payment-system.utils';
import { PaymentDetailsDto, RequestPaymentDto } from './dto/razorpay.dto';

@Injectable()
export class RazorpayService {
  public constructor(
    @InjectRazorpay() private readonly razorpayClient: Razorpay,
  ) {}

  //   razorpay payment
  async razorpayPayment(requestPayment?: RequestPaymentDto) {
    const options = {
      // TODO: Will use user defined values later
      amount: '10000',
      currency: 'INR',
      receipt: 'test_1',
    };

    const payment = await this.razorpayClient.orders.create(options);

    return {
      order_id: payment.id,
      currency: payment.currency,
      amount: payment.amount,
    };
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
