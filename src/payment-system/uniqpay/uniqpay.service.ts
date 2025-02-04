import { HttpService } from '@nestjs/axios';
import { Uniqpay } from './../../gateway/entities/uniqpay.entity';
import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { JwtService } from 'src/services/jwt/jwt.service';
import { GatewayName } from 'src/utils/enum/enum';
import { Repository } from 'typeorm';
import uniqid from 'uniqid';

@Injectable()
export class UniqpayService {
  constructor(
    @InjectRepository(Uniqpay)
    private readonly uniqpayRepository: Repository<Uniqpay>,
    @InjectRepository(EndUser)
    private readonly endUserRepository: Repository<EndUser>,

    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) {}

  generateUniqueKey = () => uniqid();

  private async getCredentials() {
    const uniqpay = (await this.uniqpayRepository.find())[0];
    if (!uniqpay) throw new NotFoundException('Uniqpay record not found!');

    const keys = {
      uniqpayId: uniqpay.uniqpay_id,
      clientId: uniqpay.client_id,
      clientSecret: uniqpay.client_secret,
    };

    const decryptedUniqpayId = this.jwtService.decryptValue(keys.uniqpayId);
    const decryptedClientId = this.jwtService.decryptValue(keys.clientId);
    const decryptedClientSecret = this.jwtService.decryptValue(
      keys.clientSecret,
    );

    if (!decryptedUniqpayId || !decryptedClientId || !decryptedClientSecret)
      throw new Error('Failed to decrypt Uniqpay keys');

    return {
      uniqpayId: decryptedUniqpayId,
      clientId: decryptedClientId,
      clientSecret: decryptedClientSecret,
    };
  }

  async createPayout(payoutDetails) {
    const {
      name,
      email,
      phone,
      address,
      bankAccount,
      ifsc,
      transferMode,
      transferId,
      amount,
      remarks,
    } = payoutDetails;

    const { uniqpayId, clientId, clientSecret } = await this.getCredentials();

    const headers = {
      'Content-Type': 'application/json',
      'X-Upay-Client-Id': clientId,
      'X-Upay-Client-Secret': clientSecret,
    };

    const payload = {
      name,
      email,
      phone,
      address,
      bankAccount,
      ifsc,
      transferMode,
      transferId,
      amount,
      remarks,
      uniqpayId,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://apigateway.myuniqpay.com/payout-switch/api/v1/payments/payouts',
          payload,
          {
            headers,
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.log({ error: error.response.data });
    }
  }

  async makePayoutPayment({ userId, amount, orderId, mode }) {
    if (mode === 'UPI')
      throw new NotAcceptableException('Unsupported payment mode for Uniqpay!');

    const uniqpay = (await this.uniqpayRepository.find())[0];
    if (!uniqpay) throw new NotFoundException('Uniqpay record not found!');

    const endUser = await this.endUserRepository.findOneBy({ userId });
    if (!endUser) throw new NotFoundException('End user not found!');

    const userChannelDetails = JSON.parse(endUser.channelDetails);
    if (!userChannelDetails['NET_BANKING'])
      throw new NotAcceptableException('EndUser NET_BANKING details missing!');

    const payoutPayload = {
      name: endUser.name,
      email: endUser.email,
      phone: endUser.mobile,
      address: '',
      bankAccount: userChannelDetails['NET_BANKING']['Account Number'],
      ifsc: userChannelDetails['NET_BANKING']['IFSC Code'],
      transferMode: mode,
      transferId: this.generateUniqueKey(),
      amount: amount,
      remarks: `USER PAYOUT - ${orderId}`,
    };

    const response: any = await this.createPayout(payoutPayload);

    console.log({ response });

    return {
      gatewayName: GatewayName.UNIQPAY,
      transactionId: response?.transactionDetails?.transferId,
      transactionReceipt: 'UNIQPAY',
      paymentStatus: response?.status,
      transactionDetails: response,
    };
  }

  async getPayoutDetails(transferId: string) {
    const { uniqpayId, clientId, clientSecret } = await this.getCredentials();

    const headers = {
      'Content-Type': 'application/json',
      'X-Upay-Client-Id': clientId,
      'X-Upay-Client-Secret': clientSecret,
    };

    const payload = {
      transferId,
      uniqpayId,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://apigateway.myuniqpay.com/payout/paymentinquiry/api/v1/payments/get-status`,
          payload,
          {
            headers,
          },
        ),
      );

      console.log({ response });

      return {
        status: response.data.status,
        details: response.data,
      };
    } catch (error) {
      throw new Error('Failed to fetch payout details');
    }
  }
}
