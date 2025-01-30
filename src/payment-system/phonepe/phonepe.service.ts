import { HttpService } from '@nestjs/axios';
import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import sha256 from 'sha256';
import { firstValueFrom } from 'rxjs';
import { GetPayPageDto } from '../dto/getPayPage.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Phonepe } from 'src/gateway/entities/phonepe.entity';
import { JwtService } from 'src/services/jwt/jwt.service';

@Injectable()
export class PhonepeService {
  api_end_point = '/pg/v1/pay';
  redirect_url = null;

  constructor(
    @InjectRepository(Phonepe)
    private readonly phonepeRepository: Repository<Phonepe>,

    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {
    this.redirect_url = `${process.env.APP_URL}/phonepe/check-status`;
  }

  private async getCredentials(environment) {
    const phonepe = (await this.phonepeRepository.find())[0];
    if (!phonepe) throw new NotFoundException('Phonepe record not found!');

    const keys =
      environment === 'live'
        ? {
            merchantId: phonepe.merchant_id,
            saltKey: phonepe.salt_key,
            saltIndex: phonepe.salt_index,
          }
        : {
            merchantId: phonepe.sandbox_merchant_id,
            saltKey: phonepe.sandbox_salt_key,
            saltIndex: phonepe.sandbox_salt_index,
          };

    const decryptedMerchantId = this.jwtService.decryptValue(keys.merchantId);
    const decryptedSaltKey = this.jwtService.decryptValue(keys.saltKey);
    const decryptedSaltIndex = this.jwtService.decryptValue(keys.saltIndex);

    if (!decryptedMerchantId || !decryptedSaltIndex || !decryptedSaltKey)
      throw new Error('Failed to decrypt Phonepe keys');

    return {
      merchant_id: decryptedMerchantId,
      salt_key: decryptedSaltKey,
      salt_index: decryptedSaltIndex,
    };
  }

  async getPayPage(getPayPageDto: GetPayPageDto) {
    const { userId, amount, orderId, integrationId, environment } =
      getPayPageDto;

    const { merchant_id, salt_index, salt_key } =
      await this.getCredentials(environment);

    // transaction amount
    const amountInPaise = parseFloat(amount) * 100;

    const payload = {
      merchantId: merchant_id,
      merchantTransactionId: orderId,
      merchantUserId: userId,
      amount: amountInPaise,
      redirectUrl: `${process.env.PAYMENT_PAGE_BASE_URL}/close-razorpay?orderId=${orderId}`,
      redirectMode: 'REDIRECT',
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    // make base64 encoded payload
    const bufferObject = Buffer.from(JSON.stringify(payload), 'utf-8');
    const base64EncodedPayload = bufferObject.toString('base64');

    // Formula: SHA256(Base64 encoded payload + “/pg/v1/pay” + salt key) + ### + salt index
    const string = base64EncodedPayload + this.api_end_point + salt_key;
    const sha256_val = sha256(string);
    const xVerifyCheckSum = sha256_val + '###' + salt_index;

    const options = {
      headers: {
        'Content-Typpe': 'application/json',
        'X-VERIFY': xVerifyCheckSum,
        accept: 'application/json',
      },
    };

    const apiUrl =
      environment === 'live'
        ? process.env.PHONEPE_API_URL_PROD
        : process.env.PHONEPE_API_URL_UAT;

    try {
      const request_url = apiUrl + this.api_end_point;

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
        transactionId: orderId,
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

  async getPaymentStatus(transactionId: string, environment) {
    const { merchant_id, salt_index, salt_key } =
      await this.getCredentials(environment);

    if (transactionId) {
      // generate checksum
      const string = `/pg/v1/status/${merchant_id}/` + transactionId + salt_key;
      const sha256_val = sha256(string);
      const xVerifyCheckSum = sha256_val + '###' + salt_index;

      const options = {
        headers: {
          'Content-Typpe': 'application/json',
          'X-VERIFY': xVerifyCheckSum,
          'X-MERCHANT-ID': merchant_id,
          accept: 'application/json',
        },
      };

      const apiUrl =
        environment === 'live'
          ? process.env.PHONEPE_API_URL_PROD
          : process.env.PHONEPE_API_URL_UAT;

      try {
        const request_url =
          apiUrl + '/pg/v1/status/' + merchant_id + '/' + transactionId;

        const observable = this.httpService.get(request_url, options);

        const response = await firstValueFrom<any>(observable);

        return {
          status: response.data?.data?.responseCode,
          details: {
            transactionId: response.data?.data?.transactionId,
            transactionReceipt: 'TRNX-RECEIPT',
            otherPaymentDetails: response.data,
          },
        };
      } catch (error) {
        throw new ConflictException(error.response?.data || error.toString());
      }
    }
  }

  async receivePhonepeRequest(req, body, environment) {
    const { merchant_id, salt_index, salt_key } =
      await this.getCredentials(environment);

    try {
      const receivedXVerify = req.headers['x-verify'];
      if (!receivedXVerify) throw new Error('Missing X-VERIFY header');

      const parsedBody = JSON.parse(body);
      const base64Response = parsedBody.response;

      if (!base64Response)
        throw new Error('Missing response field in request body');

      const stringToHash = base64Response + salt_key;
      const sha256_val = sha256(stringToHash);
      const xVerifyCheckSum = sha256_val + '###' + salt_index;

      if (receivedXVerify !== xVerifyCheckSum)
        throw new Error('Invalid X-VERIFY header');

      const decodedResponse = Buffer.from(base64Response, 'base64').toString(
        'utf-8',
      );

      const jsonResponse = JSON.parse(decodedResponse);

      const {
        success,
        code,
        message,
        data: {
          merchantId,
          merchantTransactionId,
          transactionId,
          amount,
          state,
        },
      } = jsonResponse;

      // Return the decoded response or any custom response
      return {
        status: HttpStatus.OK,
        success,
        code,
        message,
        data: {
          merchantId,
          merchantTransactionId,
          transactionId,
          amount,
          state,
        },
      };
    } catch (error) {
      console.error('Error in receivePhonepeRequest:', error.message);

      return {
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }
}
