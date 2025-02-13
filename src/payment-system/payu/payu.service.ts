import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GetPayPageDto } from '../dto/getPayPage.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import qs from 'qs';
import uniqid from 'uniqid';
import { Repository } from 'typeorm';
import { Payu } from 'src/gateway/entities/payu.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/services/jwt/jwt.service';
import { EndUser } from 'src/end-user/entities/end-user.entity';

@Injectable()
export class PayuService {
  private authToken = {
    accessToken: '',
    expiresIn: -1,
    createdAt: -1,
    tokenType: '',
    scope: '',
  };

  constructor(
    @InjectRepository(Payu)
    private readonly payuRepository: Repository<Payu>,
    @InjectRepository(EndUser)
    private readonly endUserRepository: Repository<EndUser>,

    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  generateUniqueKey = () => uniqid();

  private isAccessTokenExpired(): boolean {
    const currentTime = Math.floor(new Date().getTime() / 1000); // Get current time in UNIX format
    const tokenExpirationTime =
      this.authToken.createdAt + this.authToken.expiresIn;

    return currentTime >= tokenExpirationTime;
  }

  async getCredentials(environment: 'live' | 'sandbox') {
    const payu = (await this.payuRepository.find())[0];
    if (!payu) throw new NotFoundException('Payu record not found!');

    const keys = {
      merchantId:
        environment === 'sandbox' ? payu.sandbox_merchant_id : payu.merchant_id,
      clientId:
        environment === 'sandbox' ? payu.sandbox_client_id : payu.client_id,
      clientSecret:
        environment === 'sandbox'
          ? payu.sandbox_client_secret
          : payu.client_secret,
    };

    const decryptedMerchantId = this.jwtService.decryptValue(keys.merchantId);
    const decryptedClientId = this.jwtService.decryptValue(keys.clientId);
    const decryptedClientSecret = this.jwtService.decryptValue(
      keys.clientSecret,
    );

    if (!decryptedMerchantId || !decryptedClientId || !decryptedClientSecret)
      throw new Error('Failed to decrypt PayU keys');

    return {
      merchant_id: decryptedMerchantId,
      client_id: decryptedClientId,
      client_secret: decryptedClientSecret,
    };
  }

  async getAccessToken(environment: 'live' | 'sandbox') {
    if (!this.isAccessTokenExpired()) return this.authToken.accessToken;

    const liveUrl = 'https://accounts.payu.in/oauth/token';
    const sandboxUrl = 'https://uat-accounts.payu.in/oauth/token';

    const { client_id, client_secret } = await this.getCredentials(environment);

    const payload = {
      client_id,
      client_secret,
      scope: 'create_payment_links read_payment_links',
      grant_type: 'client_credentials',
    };

    const url = environment === 'sandbox' ? sandboxUrl : liveUrl;

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, qs.stringify(payload), {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(client_id + ':' + client_secret).toString('base64')}`,
          },
        }),
      );

      this.authToken = {
        accessToken: response?.data?.access_token,
        expiresIn: response?.data?.expires_in,
        createdAt: response?.data?.created_at,
        tokenType: response?.data?.token_type,
        scope: response?.data?.scope,
      };

      return this.authToken.accessToken;
    } catch (error) {
      console.log({ error: error.response.data });
      throw new InternalServerErrorException(
        'Failed to get Payu access token!',
      );
    }
  }

  async getPayPage(payPageDto: GetPayPageDto) {
    const { userId, amount, environment, orderId } = payPageDto;

    const endUser = await this.endUserRepository.findOneBy({ userId });

    const testUrl = 'https://uatoneapi.payu.in/payment-links';
    const liveUrl = 'https://oneapi.payu.in/payment-links';

    const accessToken = await this.getAccessToken(environment);

    const payload = {
      invoiceNumber: this.generateUniqueKey(),
      subAmount: amount,
      description: 'User Payin',
      source: 'API',
      isPartialPaymentAllowed: false,
      currency: 'INR',
      customer: {
        name: endUser?.name || 'SANDBOX',
        email: endUser?.email || 'sandbox@user.com',
        phone: endUser?.mobile || '9876543210',
      },
      successUrl: `${process.env.PAYMENT_PAGE_BASE_URL}/close-razorpay?orderId=${orderId}`,
      failureUrl: `${process.env.PAYMENT_PAGE_BASE_URL}/close-razorpay?orderId=${orderId}`,
      enforcePayMethod: '',
      transactionId: this.generateUniqueKey(),
      userToken: accessToken,
    };

    const options = {
      method: 'POST',
      url: environment === 'sandbox' ? testUrl : liveUrl,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        mid: (await this.getCredentials(environment)).merchant_id,
      },
      data: payload,
    };

    console.log({ options });

    try {
      const response = await firstValueFrom(this.httpService.request(options));
      console.log({ response });
      return {
        url: '',
        details: '',
        trackingId: '',
      };
    } catch (error) {
      console.log({ error: error.response.data });
      // throw new InternalServerErrorException('Failed to create payment link');
    }
  }

  async getPaymentStatus(
    invoiceId: string,
    environment: 'live' | 'sandbox' = 'live',
  ) {
    const testUrl = `https://uatoneapi.payu.in/payment-links/${invoiceId}/txns?dateFrom=2024-12-12&dateTo=2025-12-12`;
    const liveUrl = `https://oneapi.payu.in/payment-links/${invoiceId}/txns?dateFrom=2024-12-12&dateTo=2025-12-12`;

    const options = {
      method: 'GET',
      url: environment === 'sandbox' ? testUrl : liveUrl,
      headers: {
        merchantId: (await this.getCredentials(environment)).merchant_id,
      },
    };

    try {
      const response = await firstValueFrom(this.httpService.request(options));

      console.log({ response });

      return {
        status: '',
        details: {},
      };
    } catch (error) {
      console.log({ error });
      throw new InternalServerErrorException(
        'Failed to get PayU transaction details!',
      );
    }
  }
}
