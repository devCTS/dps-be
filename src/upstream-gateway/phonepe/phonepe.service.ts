import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import axios from 'axios';

@Injectable()
export class PhonepeService {
  constructor(private readonly httpService: HttpService) {}

  //   Playload
  payload = {
    merchantId: process.env.MERCHANT_ID,
    merchantTransactionId: 'mid112233',
    merchantUserId: 'MUID123',
    amount: 10000,
    redirectUrl: process.env.BASE_URL,
    redirectMode: 'REDIRECT',
    mobileNumber: '9999999999',
    callBackUrl: process.env.BASE_URL,
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
    // console.log(
    //   createHash('sha256')
    //     .update(
    //       this.base64encodedPayload +
    //         process.env.PHONEPE_API_END_POINT +
    //         process.env.SAMPLE_SALT_KEY,
    //     )
    //     .digest('hex'),
    // );
    // axios
    //   .request(this.options)
    //   .then(function (response) {
    //     console.log(response.data);
    //     return response.data;
    //   })
    //   .catch(function (error) {
    //     console.error(error);
    //   });
  }
}
