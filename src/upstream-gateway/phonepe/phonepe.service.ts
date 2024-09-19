import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { generateSHA256 } from '../payment-system/payment-system.utils';
import { paymentInstruments } from './payment-instruments';
@Injectable()
export class PhonepeService {
  constructor(private readonly httpService: HttpService) {}
  merchantTransactionId = uuid();

  // Payment function
  async phonepePayement(paymentMethod) {
    const baseUrl = process.env.BASE_URL;
    const merchantTransactionId = this.merchantTransactionId;
    const merchantId = process.env.MERCHANT_ID;
    const merchantUserId = process.env.MERCHANT_USER_ID;
    const phonePayApiEndPoint = process.env.PHONEPE_API_END_POINT;
    const sampleSaltKey = process.env.SAMPLE_SALT_KEY;
    const saltIndex = process.env.SALT_INDEX;
    const phonepeBaseUrl = process.env.PHONEPE_BASE_URL;

    const payload = {
      merchantId: merchantId,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: merchantUserId,
      amount: 10000,
      redirectUrl: `${baseUrl}/phonepe/${merchantTransactionId}`,
      redirectMode: 'REDIRECT',
      mobileNumber: '9999999999',
      callBackUrl: `${baseUrl}/phonepe/${merchantTransactionId}`,
      paymentInstrument: paymentInstruments(paymentMethod),
    };

    const bufferObj: Buffer = Buffer.from(JSON.stringify(payload), 'utf8');
    const base64encodedPayload: string = bufferObj.toString('base64');

    const stringForHash = `${base64encodedPayload}${phonePayApiEndPoint}${sampleSaltKey}`;

    const xVerify = generateSHA256(stringForHash) + '###' + saltIndex;

    const options = {
      method: 'post',
      url: phonepeBaseUrl,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
      },
      data: {
        request: base64encodedPayload,
      },
    };

    const val = await this.httpService.axiosRef.request(options);
    return val.data.data;
  }

  // check status
  async checkStatus(transactionId: string) {
    const phonepeStatusEndPoint = process.env.PHONEPE_STATUS_END_POINT;
    const sampleSaltKey = process.env.SAMPLE_SALT_KEY;
    const merchantId = process.env.MERCHANT_ID;
    const saltIndex = process.env.SALT_INDEX;
    const stringForHash = `${phonepeStatusEndPoint}/${merchantId}/${transactionId}${sampleSaltKey}`;
    const checkStatusUrl = `https://api-preprod.phonepe.com/apis/pg-sandbox${phonepeStatusEndPoint}/${merchantId}/${transactionId}`;
    const statusXverify = `${generateSHA256(stringForHash)}###${saltIndex}`;

    // options
    const options = {
      method: 'get',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': statusXverify,
        'X-MERCHANT-ID': merchantId,
      },
    };

    const val = await this.httpService.axiosRef.get(checkStatusUrl, options);

    return val.data;
  }
}
