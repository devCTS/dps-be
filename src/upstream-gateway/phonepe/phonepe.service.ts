import { HttpService } from '@nestjs/axios';
import { Injectable, Redirect } from '@nestjs/common';
import { createHash } from 'node:crypto';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
@Injectable()
export class PhonepeService {
  constructor(private readonly httpService: HttpService) {}
  merchantTransactionId = uuid();

  //   Playload
  payload = {
    merchantId: process.env.MERCHANT_ID,
    merchantTransactionId: this.merchantTransactionId,
    merchantUserId: 'MUID123',
    amount: 10000,
    redirectUrl: `${process.env.BASE_URL}/phonepe/${this.merchantTransactionId}`,
    redirectMode: 'REDIRECT',
    mobileNumber: '9999999999',
    callBackUrl: `${process.env.BASE_URL}/phonepe/${this.merchantTransactionId}`,
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  //   Base 64
  bufferObj: Buffer = Buffer.from(JSON.stringify(this.payload), 'utf8');
  base64encodedPayload: string = this.bufferObj.toString('base64');

  //   X-VERIFY
  xVerify =
    createHash('sha256')
      .update(
        this.base64encodedPayload +
          process.env.PHONEPE_API_END_POINT +
          process.env.SAMPLE_SALT_KEY,
      )
      .digest('hex') +
    '###' +
    process.env.SALT_INDEX;

  // Option for request
  options = {
    method: 'post',
    url: `${process.env.PHONEPE_BASE_URL}`,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'X-VERIFY': this.xVerify,
    },
    data: {
      request: this.base64encodedPayload,
    },
  };

  // Payment function
  async phonepePayement() {
    return axios
      .request(this.options)
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  // check status

  async checkStatus(transactionId: string) {
    const statusXverify =
      createHash('sha256')
        .update(
          `${process.env.PHONEPE_STATUS_END_POINT}/${process.env.MERCHANT_ID}/${transactionId}${process.env.SAMPLE_SALT_KEY}`,
        )
        .digest('hex') +
      '###' +
      process.env.SALT_INDEX;
    // Status API

    const options = {
      method: 'get',
      url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/PGTESTPAYUAT86/${transactionId}`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': statusXverify,
        'X-MERCHANT-ID': 'PGTESTPAYUAT86',
      },
    };

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        return response.data;
      })
      .catch(function (error) {
        console.error(error);
      });

    return statusXverify;
  }
}
