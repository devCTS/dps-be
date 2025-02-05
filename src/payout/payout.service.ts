import {
  ForbiddenException,
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { In, MoreThan, Repository } from 'typeorm';

import {
  AlertType,
  ChannelName,
  GatewayName,
  NotificationStatus,
  NotificationType,
  OrderStatus,
  OrderType,
  PaymentMadeOn,
  Users,
  UserTypeForTransactionUpdates,
} from 'src/utils/enum/enum';
import { EndUserService } from 'src/end-user/end-user.service';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import uniqid from 'uniqid';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { TransactionUpdatesPayoutService } from 'src/transaction-updates/transaction-updates-payout.service';
import { Member } from 'src/member/entities/member.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { MemberService } from 'src/member/member.service';
import { MerchantService } from 'src/merchant/merchant.service';
import { AgentService } from 'src/agent/agent.service';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { PaymentSystemService } from 'src/payment-system/payment-system.service';
import { AssignPayoutOrderDto } from './dto/assign-payout-order.dto';
import { FundRecordService } from 'src/fund-record/fund-record.service';
import { NotificationService } from 'src/notification/notification.service';
import { AlertService } from 'src/alert/alert.service';
import { IdentityService } from 'src/identity/identity.service';
import { RazorpayService } from 'src/payment-system/razorpay/razorpay.service';
import { map } from 'rxjs';
import { UniqpayService } from 'src/payment-system/uniqpay/uniqpay.service';

@Injectable()
export class PayoutService {
  private enableGateway = true;

  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(EndUser)
    private readonly endUserRepository: Repository<EndUser>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,

    private readonly transactionUpdatePayoutService: TransactionUpdatesPayoutService,
    private readonly endUserService: EndUserService,
    private readonly memberService: MemberService,
    private readonly merchantService: MerchantService,
    private readonly agentService: AgentService,
    private readonly systemConfigService: SystemConfigService,
    private readonly paymentSystemService: PaymentSystemService,
    private readonly fundRecordService: FundRecordService,
    private readonly notificationService: NotificationService,
    private readonly identityService: IdentityService,
    private readonly razorpayService: RazorpayService,
    private readonly uniqpayService: UniqpayService,

    @Inject(forwardRef(() => AlertService))
    private readonly alertService: AlertService,
  ) {}

  async create(
    payoutDetails: CreatePayoutDto,
    merchantId: number,
    clientIp: string,
  ) {
    const { name, email, channelDetails, channel, mobile, userId } =
      payoutDetails;

    const merchant = await this.merchantRepository.findOne({
      where: {
        id: merchantId,
      },
      relations: ['identity', 'identity.ips'],
    });
    if (!merchant) throw new NotFoundException('Merchant not found!');

    if (merchant.identity?.ips?.length) {
      const whiteListedIps = merchant.identity.ips.map((item) => item.value);

      if (!whiteListedIps.includes(clientIp))
        throw new ForbiddenException(
          'Your IP address is not allowed to generate a payout request!',
        );
    }

    const currentAvailableBalance =
      await this.identityService.getCurrentBalalnce(merchant.identity.email);

    if (currentAvailableBalance < payoutDetails.amount)
      return {
        error: true,
        message: 'Your current available balance is not sufficient!',
      };

    if (
      payoutDetails.amount < merchant.minPayout ||
      payoutDetails.amount > merchant.maxPayout
    )
      return {
        error: true,
        message: `Min Payout Amount - ${merchant.minPayout} | Max payout Amount - ${merchant.maxPayout}`,
      };

    let endUserData = await this.endUserRepository.findOne({
      where: { userId, merchant: { id: merchantId } },
    });

    if (endUserData) {
      if (endUserData.isBlacklisted)
        throw new NotAcceptableException('This user is currently blacklisted!');

      const parsedChannedDetails = JSON.parse(endUserData.channelDetails) || {};

      if (parsedChannedDetails[channel]) delete parsedChannedDetails[channel];

      parsedChannedDetails[channel] = JSON.parse(channelDetails);

      await this.endUserRepository.update(endUserData.id, {
        channelDetails: JSON.stringify(parsedChannedDetails),
        name,
        mobile,
        email,
      });
    } else {
      const parsedChannelDetails = {
        [channel]: JSON.parse(channelDetails),
      };

      endUserData = await this.endUserService.create({
        email,
        channelDetails: JSON.stringify(parsedChannelDetails),
        channel,
        mobile,
        name,
        userId,
        merchant,
      });
    }

    const payout = await this.payoutRepository.save({
      ...payoutDetails,
      user: endUserData,
      merchant,
      systemOrderId: `PAYOUT-${uniqid()}`.toUpperCase(),
    });

    if (!payout) throw new InternalServerErrorException('Payout error');

    if (payout)
      await this.transactionUpdatePayoutService.create({
        orderDetails: payout,
        orderType: OrderType.PAYOUT,
        userId: merchant.identity.id,
        systemOrderId: payout.systemOrderId,
      });

    await this.notificationService.create({
      for: null,
      type: NotificationType.GRAB_PAYOUT,
      data: {
        orderId: payout.systemOrderId,
        amount: payout.amount,
        channel: payout.channel,
      },
    });

    if (this.enableGateway) {
      const { payoutTimeout } = await this.systemConfigService.findLatest();

      let intervalId = setInterval(async () => {
        try {
          const response = await this.findOne(payout.systemOrderId);

          if (response.status === OrderStatus.ASSIGNED) {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
            return HttpStatus.CREATED;
          }
        } catch (error) {
          console.error('Error fetching the API:', error);
        }
      }, 500);

      const timeoutId = setTimeout(async () => {
        clearInterval(intervalId);

        const result = await this.paymentSystemService.makeGatewayPayout({
          userId: endUserData.userId,
          orderId: payout.systemOrderId,
          amount: payout.amount,
          orderType: OrderType.PAYOUT,
          mode: payout.channel === ChannelName.UPI ? 'UPI' : 'IMPS',
        });

        console.log({ result });

        await this.updatePayoutStatusToAssigned({
          id: payout.systemOrderId,
          paymentMode: PaymentMadeOn.GATEWAY,
          gatewayServiceRate: payout.gatewayServiceRate || 0.1,
          gatewayName: result.gatewayName,
        });

        if (result.paymentStatus) {
          await this.updatePayoutStatusToSubmitted({
            id: payout.systemOrderId,
            transactionId: result.transactionId,
            transactionReceipt: result.transactionReceipt,
            transactionDetails: result.transactionDetails,
          });

          const mappedStatus = this.mapAndGetGatewayPayoutStatus(
            result.gatewayName,
            result.paymentStatus,
          );

          if (mappedStatus === 'SUCCESS')
            await this.updatePayoutStatusToComplete({
              id: payout.systemOrderId,
            });

          if (mappedStatus === 'FAILED')
            await this.updatePayoutStatusToFailed({
              id: payout.systemOrderId,
            });
        }
        return HttpStatus.CREATED;
      }, payoutTimeout * 1000);
    }
    return HttpStatus.CREATED;
  }

  async updatePayoutStatusToAssigned(
    assignPayoutOrderDto: AssignPayoutOrderDto,
  ) {
    const { id, paymentMode, memberId, gatewayServiceRate, gatewayName } =
      assignPayoutOrderDto;

    // Fetch payout order details
    const payoutOrderData = await this.payoutRepository.findOne({
      where: {
        systemOrderId: id,
      },
    });
    const payoutAmount = payoutOrderData.amount;

    // Fetch member and member Data
    const memberData = await this.memberRepository.findOne({
      where: {
        id: memberId,
      },
      relations: ['identity.upi', 'identity.eWallet', 'identity.netBanking'],
    });

    const minPayoutAmount = memberData.singlePayoutLowerLimit;
    const maxPayoutAmount = memberData.singlePayoutUpperLimit;
    const dailyPayoutLimit = memberData.dailyTotalPayoutLimit;

    // Fetch total payouts assigned submitted and completed by member within 24 hrs
    // 24 hrs filter
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const payoutMadeByMember = await this.payoutRepository.find({
      where: {
        status: In([
          OrderStatus.COMPLETE,
          OrderStatus.SUBMITTED,
          OrderStatus.ASSIGNED,
        ]),
        updatedAt: MoreThan(twentyFourHoursAgo),
      },
      relations: ['member'],
    });

    // Accumulated amount
    const accumulatedAmount = payoutMadeByMember.reduce(function (
      accumulator,
      curValue,
    ) {
      return accumulator + curValue.amount;
    }, 0);

    if (payoutAmount < minPayoutAmount) {
      throw new NotAcceptableException(
        'Payout amount cannot be less than min payout amount',
      );
    }

    if (payoutAmount > maxPayoutAmount) {
      throw new NotAcceptableException(
        'Payout amount cannot be more than max payout amount',
      );
    }

    if (dailyPayoutLimit < accumulatedAmount + payoutAmount) {
      throw new NotAcceptableException('Daily payout limit reached');
    }

    if (payoutOrderData.payoutMadeVia === PaymentMadeOn.MEMBER) {
      if (
        !memberData.identity.upi &&
        !memberData.identity.netBanking &&
        !memberData.identity.eWallet
      )
        throw new NotFoundException('Channels not found');

      if (
        payoutOrderData.channel === ChannelName.UPI &&
        !memberData.identity.upi.length
      )
        throw new NotFoundException('UPI channel is not registered!');

      if (
        payoutOrderData.channel === ChannelName.E_WALLET &&
        !memberData.identity?.eWallet?.length
      )
        throw new NotFoundException('E-Wallet channel is not registered!');

      if (
        payoutOrderData.channel === ChannelName.BANKING &&
        !memberData.identity?.netBanking?.length
      )
        throw new NotFoundException('NetBanking channel is not registered!');
    }

    if (
      paymentMode === PaymentMadeOn.GATEWAY &&
      (!gatewayServiceRate || !gatewayName)
    )
      throw new NotAcceptableException(
        'gateway service rate or gateway payment details missing!',
      );

    const payoutOrderDetails = await this.payoutRepository.findOne({
      where: { systemOrderId: id },
      relations: ['merchant'],
    });

    if (!payoutOrderDetails) throw new NotFoundException('Order not found');

    if (payoutOrderDetails.status !== OrderStatus.INITIATED)
      throw new NotAcceptableException('order status is not initiated!');

    let member;
    if (paymentMode === PaymentMadeOn.MEMBER)
      member = await this.memberRepository.findOne({
        where: { id: memberId },
        relations: ['identity'],
      });

    if (paymentMode === PaymentMadeOn.MEMBER)
      await this.transactionUpdatePayoutService.create({
        orderDetails: payoutOrderDetails,
        userId: member.identity.id,
        forMember: true,
        orderType: OrderType.PAYOUT,
        systemOrderId: payoutOrderDetails.systemOrderId,
      });

    if (paymentMode === PaymentMadeOn.GATEWAY) {
      await this.transactionUpdateRepository.save({
        orderType: OrderType.PAYOUT,
        userType: UserTypeForTransactionUpdates.GATEWAY_FEE,
        name: paymentMode,
        rate: gatewayServiceRate,
        amount: (payoutOrderDetails.amount / 100) * gatewayServiceRate,
        before: 0,
        after: 0,
        payoutOrder: payoutOrderDetails,
      });

      await this.transactionUpdatePayoutService.addSystemProfit({
        orderDetails: payoutOrderDetails,
        orderType: OrderType.PAYOUT,
        systemOrderId: payoutOrderDetails.systemOrderId,
        amount: 0,
      });
    }

    await this.payoutRepository.update(
      { systemOrderId: id },
      {
        status: OrderStatus.ASSIGNED,
        payoutMadeVia: paymentMode,
        member: paymentMode === PaymentMadeOn.MEMBER ? member : null,
        gatewayName: paymentMode === PaymentMadeOn.GATEWAY ? gatewayName : null,
        gatewayServiceRate:
          paymentMode === PaymentMadeOn.GATEWAY ? gatewayServiceRate : null,
        transactionDetails:
          paymentMode === PaymentMadeOn.MEMBER
            ? JSON.stringify({
                upi: memberData.identity.upi,
                netBanking: memberData.identity.netBanking,
                eWallet: memberData.identity.eWallet,
              })
            : null,
      },
    );

    return HttpStatus.OK;
  }

  async updatePayoutStatusToComplete(body) {
    const { id } = body;

    const payoutOrderDetails = await this.payoutRepository.findOne({
      where: {
        systemOrderId: id,
      },
      relations: ['member', 'merchant', 'user'],
    });
    if (!payoutOrderDetails) throw new NotFoundException('Order not found');

    if (payoutOrderDetails.status !== OrderStatus.SUBMITTED)
      throw new NotAcceptableException(
        'order status is not submitted or already failed or completed!',
      );

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId: id,
          pending: true,
        },
        relations: ['user'],
      });

    transactionUpdateEntries.forEach(async (entry) => {
      if (entry.userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE) {
        const afterBalance = -(entry.before - entry.after);

        await this.merchantService.updateBalance(
          entry.user.id,
          entry.systemOrderId,
          afterBalance,
          false,
        );
      }

      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_BALANCE) {
        const afterBalance = entry.after - entry.before;

        await this.memberService.updateBalance(
          entry.user.id,
          entry.systemOrderId,
          afterBalance,
          false,
        );
      }

      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_QUOTA) {
        const afterAmount = entry.after - entry.before;

        await this.memberService.updateQuota(
          entry.user.id,
          entry.systemOrderId,
          afterAmount,
          false,
        );
      }

      if (entry.userType === UserTypeForTransactionUpdates.AGENT_BALANCE) {
        const afterBalance = entry.after - entry.before;

        await this.agentService.updateBalance(
          entry.user.id,
          entry.systemOrderId,
          afterBalance,
          false,
        );
      }

      if (entry.userType === UserTypeForTransactionUpdates.SYSTEM_PROFIT)
        await this.systemConfigService.updateSystemProfit(
          entry.amount,
          entry.systemOrderId,
          false,
        );

      await this.transactionUpdateRepository.update(entry.id, {
        pending: false,
      });
    });

    await this.fundRecordService.addFundRecordForSuccessOrder({
      systemOrderId: payoutOrderDetails.systemOrderId,
      orderAmount: payoutOrderDetails.amount,
      orderType: OrderType.PAYOUT,
    });

    await this.payoutRepository.update(
      { systemOrderId: id },
      {
        status: OrderStatus.COMPLETE,
      },
    );

    if (payoutOrderDetails.payoutMadeVia === PaymentMadeOn.MEMBER)
      await this.notificationService.create({
        for: payoutOrderDetails.member.id,
        type: NotificationType.PAYOUT_VERIFIED,
        data: {
          orderId: payoutOrderDetails.systemOrderId,
          amount: payoutOrderDetails.amount,
          channel: payoutOrderDetails.channel,
        },
      });

    await this.alertService.create({
      for: payoutOrderDetails.merchant.id,
      userType: Users.MERCHANT,
      type: AlertType.PAYOUT_SUCCESS,
      data: {
        orderId: payoutOrderDetails.systemOrderId,
        amount: payoutOrderDetails.amount,
        channel: payoutOrderDetails.channel,
      },
    });

    const endUser = await this.endUserRepository.findOne({
      where: {
        id: payoutOrderDetails.user.id,
      },
    });

    await this.endUserRepository.update(endUser.id, {
      totalPayoutAmount: endUser.totalPayoutAmount + payoutOrderDetails.amount,
    });

    return HttpStatus.OK;
  }

  async updatePayoutStatusToFailed(body) {
    const { id } = body;

    const payoutOrderDetails = await this.payoutRepository.findOne({
      where: {
        systemOrderId: id,
      },
      relations: ['member', 'merchant'],
    });
    if (!payoutOrderDetails) throw new NotFoundException('Order not found');

    if (payoutOrderDetails.status !== OrderStatus.SUBMITTED)
      throw new NotAcceptableException(
        'order status is not submitted or already failed or completed!',
      );

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId: id,
          pending: true,
        },
        relations: ['payoutOrder', 'user'],
      });

    transactionUpdateEntries.forEach(async (entry) => {
      if (entry.userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE)
        await this.merchantService.updateBalance(
          entry.user.id,
          entry.systemOrderId,
          0,
          true,
        );

      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_BALANCE)
        await this.memberService.updateBalance(
          entry.user.id,
          entry.systemOrderId,
          0,
          true,
        );

      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_QUOTA)
        await this.memberService.updateQuota(
          entry.user.id,
          entry.systemOrderId,
          0,
          true,
        );

      if (entry.userType === UserTypeForTransactionUpdates.AGENT_BALANCE)
        await this.agentService.updateBalance(
          entry.user.id,
          entry.systemOrderId,
          0,
          true,
        );

      if (entry.userType === UserTypeForTransactionUpdates.SYSTEM_PROFIT)
        await this.systemConfigService.updateSystemProfit(
          0,
          payoutOrderDetails.systemOrderId,
          true,
        );

      await this.transactionUpdateRepository.update(entry.id, {
        pending: false,
      });
    });

    await this.payoutRepository.update(
      { systemOrderId: id },
      { status: OrderStatus.FAILED },
    );

    if (payoutOrderDetails.payoutMadeVia === PaymentMadeOn.MEMBER)
      await this.notificationService.create({
        for: payoutOrderDetails.member.id,
        type: NotificationType.PAYOUT_REJECTED,
        data: {
          orderId: payoutOrderDetails.systemOrderId,
          amount: payoutOrderDetails.amount,
          channel: payoutOrderDetails.channel,
        },
      });

    await this.alertService.create({
      for: payoutOrderDetails.merchant.id,
      userType: Users.MERCHANT,
      type: AlertType.PAYOUT_FAILED,
      data: {
        orderId: payoutOrderDetails.systemOrderId,
        amount: payoutOrderDetails.amount,
        channel: payoutOrderDetails.channel,
      },
    });

    return HttpStatus.OK;
  }

  async updatePayoutStatusToSubmitted(body) {
    const { id, transactionId, transactionReceipt, transactionDetails } = body;

    if (!transactionId && !transactionReceipt)
      throw new NotAcceptableException('Transaction ID or receipt missing!');

    const payoutOrderDetails = await this.payoutRepository.findOneBy({
      systemOrderId: id,
    });

    if (!payoutOrderDetails) throw new NotFoundException('Order not found');

    if (payoutOrderDetails.status !== OrderStatus.ASSIGNED)
      throw new NotAcceptableException('order status is not assigned!');

    let updatedTransactionDetails = payoutOrderDetails.transactionDetails;
    if (
      payoutOrderDetails.payoutMadeVia === PaymentMadeOn.GATEWAY &&
      transactionDetails
    ) {
      updatedTransactionDetails = transactionDetails;
    }

    await this.payoutRepository.update(
      { systemOrderId: id },
      {
        status: OrderStatus.SUBMITTED,
        transactionId,
        transactionReceipt,
        transactionDetails: updatedTransactionDetails,
      },
    );

    return HttpStatus.OK;
  }

  async handleNotificationStatusSuccess(systemOrderId: string) {
    const payoutOrderDetails = await this.payoutRepository.findOne({
      where: {
        systemOrderId,
      },
    });

    if (!payoutOrderDetails)
      throw new NotFoundException('Order details not found');

    await this.payoutRepository.update(payoutOrderDetails.id, {
      notificationStatus: NotificationStatus.SUCCESS,
    });

    return HttpStatus.OK;
  }

  async findOne(id: string) {
    return await this.payoutRepository.findOneBy({ systemOrderId: id });
  }

  async fetchPendingPayoutsAndUpdateStatus() {
    const pendingPayouts = await this.payoutRepository.findBy({
      status: In([OrderStatus.ASSIGNED, OrderStatus.SUBMITTED]),
      payoutMadeVia: PaymentMadeOn.GATEWAY,
    });
    if (!pendingPayouts.length) return;

    pendingPayouts.forEach(async (payout) => {
      if (payout.transactionId) {
        let response;

        if (payout.gatewayName === GatewayName.RAZORPAY)
          response = await this.razorpayService.getPayoutDetails(
            payout.transactionId,
          );

        if (payout.gatewayName === GatewayName.UNIQPAY)
          response = await this.uniqpayService.getPayoutDetails(
            payout.transactionId,
          );

        const mappedStatus = this.mapAndGetGatewayPayoutStatus(
          payout.gatewayName,
          response?.status,
        );

        if (mappedStatus === 'SUCCESS')
          await this.updatePayoutStatusToComplete({
            id: payout.systemOrderId,
          });

        if (mappedStatus === 'FAILED')
          await this.updatePayoutStatusToFailed({
            id: payout.systemOrderId,
          });
      }
    });
  }

  private mapAndGetGatewayPayoutStatus(
    gateway: GatewayName,
    status: string,
  ): 'FAILED' | 'SUCCESS' | 'PENDING' {
    switch (gateway) {
      case GatewayName.RAZORPAY:
        if (status === 'processed') return 'SUCCESS';
        if (
          status === 'failed' ||
          status === 'rejected' ||
          status === 'cancelled'
        )
          return 'FAILED';

        return 'PENDING';

      case GatewayName.UNIQPAY:
        if (status === 'Transaction Successful') return 'SUCCESS';

        if (
          status === 'Transaction Failed' ||
          status === 'FAILED' ||
          status === 'FORBIDDEN' ||
          status === 'Internal processing error' ||
          status === 'Duplicate Transaction'
        )
          return 'FAILED';

        return 'PENDING';

      default:
        return 'PENDING';
    }
  }
}
