import { HttpService } from '@nestjs/axios';
import { Uniqpay } from './../../gateway/entities/uniqpay.entity';
import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { JwtService } from 'src/services/jwt/jwt.service';
import { GatewayName } from 'src/utils/enum/enum';
import { Repository } from 'typeorm';
import uniqid from 'uniqid';
import { Identity } from 'src/identity/entities/identity.entity';
import { IdentityService } from 'src/identity/identity.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UniqpayService {
  constructor(
    @InjectRepository(Uniqpay)
    private readonly uniqpayRepository: Repository<Uniqpay>,
    @InjectRepository(EndUser)
    private readonly endUserRepository: Repository<EndUser>,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,

    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly identityService: IdentityService,
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
      console.log({ error: JSON.stringify(error.response.data) });
    }
  }

  async makePayoutPaymentForEndUsers({ userId, amount, orderId, mode }) {
    if (mode !== 'IMPS') return;

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
      address: 'INDIA',
      bankAccount: userChannelDetails['NET_BANKING']['Account Number'],
      ifsc: userChannelDetails['NET_BANKING']['IFSC Code'],
      transferMode: mode,
      transferId: this.generateUniqueKey(),
      amount: amount,
      remarks: `USER PAYOUT - ${orderId}`,
    };

    const response: any = await this.createPayout(payoutPayload);

    return {
      gatewayName: GatewayName.UNIQPAY,
      transactionId: response?.response?.transactionDetails?.transferId,
      transactionReceipt: 'UNIQPAY',
      paymentStatus: response?.response?.status,
      transactionDetails: response?.response,
    };
  }

  async makePayoutPaymentForInternalUsers({
    identityId,
    amount,
    orderId,
    mode,
  }) {
    if (mode !== 'IMPS') return;

    const uniqpay = (await this.uniqpayRepository.find())[0];
    if (!uniqpay) throw new NotFoundException('Uniqpay record not found!');

    const identity = await this.identityRepository.findOne({
      where: {
        id: identityId,
      },
      relations: ['netBanking'],
    });
    if (!identity) throw new NotFoundException('Identity not found!');

    const userBankingDetails = identity.netBanking[0];
    if (!userBankingDetails)
      throw new NotAcceptableException('User NET_BANKING details missing!');

    const user = await this.identityService.getUser(
      identityId,
      identity.userType,
    );

    const payoutPayload = {
      name: user.firstName + ' ' + user.lastName,
      email: identity.email,
      phone: user.phone,
      address: 'INDIA',
      bankAccount: userBankingDetails.accountNumber,
      ifsc: userBankingDetails.ifsc,
      transferMode: 'IMPS',
      transferId: this.generateUniqueKey(),
      amount: amount,
      remarks: `USER WITHDRAWAL - ${orderId}`,
    };

    const response: any = await this.createPayout(payoutPayload);

    return {
      gatewayName: GatewayName.UNIQPAY,
      transactionId: response?.response?.transactionDetails?.transferId,
      transactionReceipt: 'UNIQPAY',
      paymentStatus: response?.response?.status,
      transactionDetails: response?.response,
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

      return {
        status: response.data?.response?.status,
        details: response.data?.response,
      };
    } catch (error) {
      throw new Error('Failed to fetch payout details');
    }
  }
}
