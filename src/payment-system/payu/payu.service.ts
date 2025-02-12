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

@Injectable()
export class PayuService {
  constructor(
    @InjectRepository(Payu)
    private readonly payuRepository: Repository<Payu>,

    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  generateUniqueKey = () => uniqid();

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
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to get Payu access token!',
      );
    }
  }

  async getPayPage(payPageDto: GetPayPageDto) {
    const { userId, amount, environment } = payPageDto;

    const testUrl = 'https://uatoneapi.payu.in/payment-links';
    const liveUrl = 'https://oneapi.payu.in/payment-links';

    const payload = {
      invoiceNumber: this.generateUniqueKey(),
      subAmount: amount,
      description: 'User Payin',
      source: 'API',
      isPartialPaymentAllowed: false,
      currency: 'INR',
      customer: {
        name: '',
        email: '',
        phone: '',
      },
      successUrl: '',
      failureUrl: '',
      enforcePayMethod: '',
      transactionId: this.generateUniqueKey(),
      userToken: '',
    };

    const options = {
      method: 'POST',
      url: environment === 'sandbox' ? testUrl : liveUrl,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Bearer {}`,
        mid: '',
      },
      data: payload,
    };

    try {
      const response = await firstValueFrom(this.httpService.request(options));
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create payment link');
    }
  }
}
