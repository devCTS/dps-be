import { HttpService } from '@nestjs/axios';
import { ConflictException, Injectable } from '@nestjs/common';
import uniqid from 'uniqid';
import sha256 from 'sha256';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import { GetPayPageDto } from '../dto/getPayPage.dto';

@Injectable()
export class PhonepeService {
  merchant_id = null;
  salt_key = null;
  salt_index = null;
  api_url = null;
  api_end_point = '/pg/v1/pay';
  redirect_url = null;

  constructor(private readonly httpService: HttpService) {
    this.merchant_id = process.env.MERCHANT_ID;
    this.salt_key = process.env.SALT_KEY;
    this.salt_index = process.env.SALT_INDEX;
    this.api_url = process.env.PHONEPE_API_URL;
    this.redirect_url = `${process.env.APP_URL}/phonepe/check-status`;
  }

  async getPayPage(getPayPageDto: GetPayPageDto) {
    const { userId, amount, orderId } = getPayPageDto;
    // transaction amount
    const amountInPaise = parseFloat(amount) * 100;

    // Generate a unique merchant transaction ID for each transaction
    const merchantTransactionId = orderId;

    const payload = {
      merchantId: this.merchant_id,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId,
      amount: amountInPaise,
      redirectUrl: this.redirect_url + `/${merchantTransactionId}/${userId}`,
      redirectMode: 'REDIRECT',
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    // make base64 encoded payload
    const bufferObject = Buffer.from(JSON.stringify(payload), 'utf-8');
    const base64EncodedPayload = bufferObject.toString('base64');

    // Formula: SHA256(Base64 encoded payload + “/pg/v1/pay” + salt key) + ### + salt index
    const string = base64EncodedPayload + this.api_end_point + this.salt_key;
    const sha256_val = sha256(string);
    const xVerifyCheckSum = sha256_val + '###' + this.salt_index;

    const options = {
      headers: {
        'Content-Typpe': 'application/json',
        'X-VERIFY': xVerifyCheckSum,
        accept: 'application/json',
      },
    };

    try {
      const request_url = this.api_url + this.api_end_point;

      const observable = this.httpService.post(
        request_url,
        {
          request: base64EncodedPayload,
        },
        options,
      );

      const response = await firstValueFrom<any>(observable);

      return {
        url: response.data.data.instrumentResponse.redirectInfo.url,
        transactionId: merchantTransactionId,
      };
    } catch (error) {
      throw new ConflictException(error.response?.data || error.toString());
    }
  }

  async makePayoutPayment({ userId, amount = 1000, orderId }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          gatewayName: 'PHONEPE',
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

  async checkStatus(
    responseObj: Response,
    transactionId: string,
    userId: string,
  ) {
    if (transactionId) {
      // generate checksum
      const string =
        `/pg/v1/status/${this.merchant_id}/` + transactionId + this.salt_key;
      const sha256_val = sha256(string);
      const xVerifyCheckSum = sha256_val + '###' + this.salt_index;

      const options = {
        headers: {
          'Content-Typpe': 'application/json',
          'X-VERIFY': xVerifyCheckSum,
          'X-MERCHANT-ID': this.merchant_id,
          accept: 'application/json',
        },
      };

      try {
        const request_url =
          this.api_url +
          '/pg/v1/status/' +
          this.merchant_id +
          '/' +
          transactionId;

        const observable = this.httpService.get(
          request_url,

          options,
        );

        const response = await firstValueFrom<any>(observable);
        //send data to merchant

        responseObj.send(response.data);

        // responseObj.redirect('https://ginrummy.asia/redirect.html');
      } catch (error) {
        throw new ConflictException(error.response?.data || error.toString());
      }
    }
  }
}
