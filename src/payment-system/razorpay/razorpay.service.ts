import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
//@ts-ignore

import { GetPayPageDto } from '../dto/getPayPage.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { Repository } from 'typeorm';
import { ChannelName, GatewayName } from 'src/utils/enum/enum';
import { firstValueFrom } from 'rxjs';
import { Razorpay as RazorpayEntity } from 'src/gateway/entities/razorpay.entity';
import Razorpay from 'razorpay';
import { v4 as uuid } from 'uuid';
import { JwtService } from 'src/services/jwt/jwt.service';

@Injectable()
export class RazorpayService {
  razorpayClient: any = null;
  isLiveMode = process.env.GATEWAY_MODE === 'live';

  public constructor(
    @InjectRepository(EndUser)
    private readonly endUserRepository: Repository<EndUser>,
    @InjectRepository(RazorpayEntity)
    private readonly razorpayRepository: Repository<RazorpayEntity>,

    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {
    this.isLiveMode = process.env.GATEWAY_MODE === 'live';
    this.initializeKeys();
  }

  generateUniqueKey = () => uuid();

  async initializeKeys() {
    const razorpay = (await this.razorpayRepository.find())[0];
    if (!razorpay) throw new NotFoundException('Razorpay record not found!');

    const keys = this.isLiveMode
      ? { keyId: razorpay.key_id, keySecret: razorpay.key_secret }
      : {
          keyId: razorpay.sandbox_key_id,
          keySecret: razorpay.sandbox_key_secret,
        };

    const decryptedKeyId = this.jwtService.decryptValue(keys.keyId);
    const decryptedKeySecret = this.jwtService.decryptValue(keys.keySecret);

    if (!decryptedKeyId || !decryptedKeySecret)
      throw new Error('Failed to decrypt Razorpay keys');

    this.razorpayClient = new Razorpay({
      key_id: decryptedKeyId,
      key_secret: decryptedKeySecret,
    });

    return {
      key_id: decryptedKeyId,
      key_secret: decryptedKeySecret,
    };
  }

  async getPayPage(getPayPageDto: GetPayPageDto) {
    const { userId, amount, orderId, integrationId, channelName } =
      getPayPageDto;

    const endUser = await this.endUserRepository.findOneBy({ userId });

    // transaction amount
    const amountInPaise = parseFloat(amount) * 100;
    const options = {
      amount: amountInPaise,
      customer: {
        name: endUser?.name || '',
        email: endUser?.email || '',
        contact: endUser?.mobile || '',
      },
      currency: 'INR',
      options: {
        checkout: {
          method: {
            netbanking: channelName === ChannelName.BANKING ? true : false,
            upi: channelName === ChannelName.UPI ? true : false,
            wallet: channelName === ChannelName.E_WALLET ? true : false,
            card: false,
          },
        },
      },
      callback_url: `${process.env.PAYMENT_PAGE_BASE_URL}/checkout/${integrationId}?callback=true&orderId=${orderId}`,
      callback_method: 'get',
    };

    const paymentLink = await this.razorpayClient.paymentLink.create(options);

    return {
      url: paymentLink.short_url,
      details: paymentLink,
      trackingId: paymentLink.id,
    };
  }

  async createContact(contactDetails) {
    const { name, email, contact, type, reference_id, notes } = contactDetails;

    const contactRequest = {
      name,
      email,
      contact,
      type,
      reference_id,
      notes: {
        notes_key_1: '',
        notes_key_2: '',
      },
    };

    const key_id = (await this.initializeKeys()).key_id;
    const key_secret = (await this.initializeKeys()).key_secret;

    const authHeader = `Basic ${Buffer.from(`${key_id}:${key_secret}`).toString('base64')}`;

    console.log({ key_id, key_secret });

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.razorpay.com/v1/contacts',
          contactRequest,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: authHeader,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      console.log(error.response);
    }
  }

  async createFundAccount(fundAccountDetails) {
    const {
      contact_id,
      account_type, // bank_account || vpa
      bank_account, // format bank_account: {name: "", ifsc: "", account_number: ""}
      vpa, // format - vpa: { address: "" }
    } = fundAccountDetails;

    const fundAccountRequest = {
      contact_id,
      account_type,
      bank_account,
      vpa,
    };

    // Include bank account details if the account type is 'bank_account'
    if (account_type === 'bank_account') {
      fundAccountRequest.bank_account = fundAccountDetails.bank_account;
      delete fundAccountRequest.vpa;
    }

    // Include VPA details if the account type is 'vpa'
    if (account_type === 'vpa') {
      fundAccountRequest.vpa = fundAccountDetails.vpa;
      delete fundAccountRequest.bank_account;
    }

    const key_id = (await this.initializeKeys()).key_id;
    const key_secret = (await this.initializeKeys()).key_secret;

    const authHeader = `Basic ${Buffer.from(`${key_id}:${key_secret}`).toString('base64')}`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.razorpay.com/v1/fund_accounts',
          fundAccountRequest,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: authHeader,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      console.log(error.response);
    }
  }

  async createPayout(payoutDetails) {
    const {
      userId,
      account_number, // The account from which you want to make the payout.
      amount,
      customer_bank_details,
      customer_vpa,
      customer_details,
      currency, // INR
      mode, // Netbanking - (NEFT, RTGS, IMPS, card) or VPA - (UPI)
      purpose, // refund, cashback, salary, payout, utility bill, vendor bill
      reference_id, // A user-generated reference given to the payout.
      narration, //  This is a custom note that also appears on the bank statement. If no value is passed for this parameter, it defaults to the Merchant Billing Label.
      notes, // Multiple key-value pairs that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, "note_key": "Beam me up Scotty”.
      queue_if_low_balance, // payout will be rejected if insufficient balance in acc else will be queued
    } = payoutDetails;

    const endUser = await this.endUserRepository.findOneBy({ userId });

    let contactId = endUser?.contactId;
    if (!endUser.contactId) {
      const contact = await this.createContact({
        name: customer_details.name,
        type: 'customer',
        email: customer_details.email,
        contact: customer_details.contact,
        reference_id: 'abc',
        notes: '',
      });

      contactId = contact?.id;

      await this.endUserRepository.update(endUser.id, {
        contactId,
      });
    }

    let fundAccountId = endUser?.fundAccountId;
    if (
      (mode === 'UPI' && endUser.fundAccountType !== 'vpa') ||
      (mode !== 'UPI' && endUser.fundAccountType === 'vpa')
    ) {
      const fundAccount = await this.createFundAccount({
        contact_id: contactId,
        account_type: mode === 'UPI' ? 'vpa' : 'bank_account',
        bank_account:
          mode !== 'UPI'
            ? {
                name: customer_bank_details.name,
                account_number: customer_bank_details.account_number,
                ifsc: customer_bank_details.ifsc,
              }
            : undefined,
        vpa: mode == 'UPI' ? { address: customer_vpa } : undefined,
      });

      const fundAccountType = mode === 'UPI' ? 'vpa' : 'bank_account';
      fundAccountId = fundAccount?.id;

      await this.endUserRepository.update(endUser.id, {
        fundAccountId,
        fundAccountType,
      });
    }

    const payoutRequest = {
      account_number,
      amount,
      currency,
      mode,
      purpose,
      queue_if_low_balance,
      reference_id,
      narration,
      notes,
      fund_account_id: fundAccountId,
    };

    const key_id = (await this.initializeKeys()).key_id;
    const key_secret = (await this.initializeKeys()).key_secret;

    const authHeader = `Basic ${Buffer.from(`${key_id}:${key_secret}`).toString('base64')}`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.razorpay.com/v1/payouts',
          payoutRequest,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Payout-Idempotency': this.generateUniqueKey(),
              Authorization: authHeader,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.log({ error: error.response.data });
    }
  }

  async makePayoutPayment({
    userId,
    amount,
    mode,
  }: {
    userId: string;
    amount: number;
    mode: 'UPI' | 'IMPS' | 'RTGS' | 'NEFT';
  }) {
    const razorpay = (await this.razorpayRepository.find())[0];
    if (!razorpay) throw new NotFoundException('Razorpay record not found!');

    const endUser = await this.endUserRepository.findOneBy({ userId });
    if (!endUser) throw new NotFoundException('End user not found!');

    const userChannelDetails = JSON.parse(endUser.channelDetails);
    const amountInPaise = amount * 100;

    // {"UPI":{"Upi Id":"kartik@upi","Mobile Number":"9876543210"},"NET_BANKING":{"Account Number":"123412341241234","Bank Name":"HDFC","IFSC Code":"HDFC0002900","Beneficiary Name":"KARTIK"},"E_WALLET":{"App Name":"GOOGLE PAY","Mobile Number":"9876543210"}}

    const accountNumber = this.isLiveMode
      ? razorpay?.account_number
      : razorpay?.sandbox_account_number;

    const decryptedAccountNumber = this.jwtService.decryptValue(accountNumber);

    const res = await this.createPayout({
      account_number: '924020068715927',
      amount: amountInPaise,
      customer_details: {
        name: endUser.name,
        email: endUser.email,
        contact: endUser.mobile,
        type: 'customer',
      },
      customer_bank_details:
        mode !== 'UPI'
          ? {
              name: userChannelDetails['NET_BANKING']['Bank Name'],
              account_number:
                userChannelDetails['NET_BANKING']['Account Number'],
              ifcs: userChannelDetails['NET_BANKING']['IFSC Code'],
            }
          : null,
      customer_vpa: mode === 'UPI' ? userChannelDetails['UPI']['Upi Id'] : null,
      currency: 'INR',
      mode: mode,
      purpose: 'payout',
      reference_id: `REF-PAYOUT-${userId}`,
      queue_if_low_balance: false,
      userId,
    });

    return {
      gatewayName: GatewayName.RAZORPAY,
      transactionId: res?.id || 'DUMMY_TRXN',
      transactionReceipt: 'DUMMY_RECEIPT',
      paymentStatus: res?.status,
      transactionDetails: res,
    };
  }

  async getPaymentStatus(paymentLinkId: string) {
    const paymentLinkDetails =
      await this.razorpayClient.paymentLink.fetch(paymentLinkId);

    const orderResponse = await this.razorpayClient.orders.fetchPayments(
      paymentLinkDetails?.order_id,
    );

    const orderDetails = orderResponse?.items[0];

    let status;
    if (orderDetails.status === 'captured') status = 'SUCCESS';
    if (orderDetails.status === 'failed') status = 'FAILED';

    return {
      status,
      details: {
        transactionId: paymentLinkDetails?.payments[0]?.payment_id,
        transactionReceipt: orderDetails?.receipt,
        otherPaymentDetails: orderDetails,
      },
    };
  }

  async getPayoutDetails(payoutId: string) {
    const key_id = (await this.initializeKeys()).key_id;
    const key_secret = (await this.initializeKeys()).key_secret;

    const authHeader = `Basic ${Buffer.from(`${key_id}:${key_secret}`).toString(
      'base64',
    )}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.razorpay.com/v1/payouts/${payoutId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: authHeader,
            },
          },
        ),
      );

      return {
        status: response.data.status,
        details: response.data,
      };
    } catch (error) {
      throw new Error('Failed to fetch payout details');
    }
  }
}
