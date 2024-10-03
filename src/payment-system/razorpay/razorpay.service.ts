import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
// @ts-ignore
import * as Razorpay from 'razorpay';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RazorpayService {
  razorpayClient: any = null;

  public constructor(private readonly httpService: HttpService) {
    this.razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
    });
  }

  private generateUniqueKey(): string {
    return uuidv4();
  }

  //   razorpay payment
  async getPayPage(userId: string = 'U111', amount: string = '1') {
    // transaction amount
    const amountInPaise = parseFloat(amount) * 100;
    const options = {
      amount: amountInPaise,
      customer: {
        name: 'Kartik Sahrma',
        email: 'kartik.sharma@catalyst.sh',
        contact: '9816127247',
      },
      currency: 'INR',
      options: {
        checkout: {
          method: {
            netbanking: true,
            upi: true,
            card: true,
            wallet: true,
          },
        },
      },
      // upi_link: true, // Prod only
    };

    const payment = await this.razorpayClient.paymentLink.create(options);

    return {
      url: payment.short_url,
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
        notes_key_1: 'Tea, Earl Grey, Hot',
        notes_key_2: 'Tea, Earl Grey… decaf.',
      },
    };

    const authHeader = `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_TEST_KEY_SECRET}`).toString('base64')}`;

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

    const authHeader = `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_TEST_KEY_SECRET}`).toString('base64')}`;

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
    } = payoutDetails;

    const contact = await this.createContact({
      name: customer_details.name,
      type: 'customer',
      email: customer_details.email,
      contact: customer_details.contact,
      reference_id: 'abc',
      notes: '',
    });

    const fundAccount = await this.createFundAccount({
      contact_id: contact?.id,
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

    const payoutRequest = {
      ...payoutDetails,
      fund_account_id: fundAccount.id,
      queue_if_low_balance: true, // The payout is queued when your business account does not have sufficient balance to process the payout.
    };

    const authHeader = `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_TEST_KEY_SECRET}`).toString('base64')}`;

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
      console.log(error.response);
    }
  }
}
