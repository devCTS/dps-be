import { Injectable } from '@nestjs/common';

@Injectable()
export class UniqpayService {
  constructor() {}

  async makePayoutPayment({ userId, amount = 1000, orderId }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          gatewayName: 'UNIQPAY',
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
}
