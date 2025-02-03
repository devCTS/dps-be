import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import uniqid from 'uniqid';
import { Payin } from './entities/payin.entity';
import {
  AlertType,
  CallBackStatus,
  GatewayName,
  NotificationType,
  OrderStatus,
  OrderType,
  PaymentMadeOn,
  Users,
  UserTypeForTransactionUpdates,
} from 'src/utils/enum/enum';
import { TransactionUpdatesPayinService } from 'src/transaction-updates/transaction-updates-payin.service';
import { EndUserService } from 'src/end-user/end-user.service';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { Member } from 'src/member/entities/member.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { MemberService } from 'src/member/member.service';
import { MerchantService } from 'src/merchant/merchant.service';
import { AgentService } from 'src/agent/agent.service';
import {
  CreatePaymentOrderDto,
  CreatePaymentOrderDtoAdmin,
  CreatePaymentOrderSandboxDto,
} from 'src/payment-system/dto/createPaymentOrder.dto';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { FundRecordService } from 'src/fund-record/fund-record.service';
import { NotificationService } from 'src/notification/notification.service';
import { AlertService } from 'src/alert/alert.service';
import { PayinSandbox } from './entities/payin-sandbox.entity';

@Injectable()
export class PayinService {
  constructor(
    @InjectRepository(Payin)
    private readonly payinRepository: Repository<Payin>,
    @InjectRepository(PayinSandbox)
    private readonly payinSandboxRepository: Repository<PayinSandbox>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(EndUser)
    private readonly endUserRepository: Repository<EndUser>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,

    private readonly transactionUpdateService: TransactionUpdatesPayinService,
    private readonly endUserService: EndUserService,
    private readonly systemConfigService: SystemConfigService,
    private readonly memberService: MemberService,
    private readonly merchantService: MerchantService,
    private readonly agentService: AgentService,
    private readonly fundRecordService: FundRecordService,
    private readonly notificationService: NotificationService,
    private readonly alertService: AlertService,
  ) {}

  async create(payinDetails: CreatePaymentOrderDto) {
    const { userId, userName, channel, integrationId, orderId, amount } =
      payinDetails;

    const merchant = await this.merchantRepository.findOne({
      where: {
        integrationId,
      },
      relations: ['identity'],
    });
    if (!merchant)
      throw new InternalServerErrorException('Merchant not found!');

    let endUser = await this.endUserRepository.findOne({
      where: { userId, merchant: { id: merchant.id } },
      relations: ['merchant'],
    });

    if (endUser?.isBlacklisted)
      throw new NotAcceptableException('This user is currently blacklisted!');

    if (!endUser)
      endUser = await this.endUserService.create({
        name: userName,
        channel,
        userId,
        merchant,
      });

    const payin = await this.payinRepository.save({
      merchantOrderId: orderId,
      user: endUser,
      systemOrderId: `PAYIN-${uniqid()}`.toUpperCase(),
      merchant,
      amount,
      channel,
    });

    if (payin)
      await this.transactionUpdateService.create({
        orderDetails: payin,
        orderType: OrderType.PAYIN,
        systemOrderId: payin.systemOrderId,
        userId: merchant.identity.id,
      });

    return payin;
  }

  async createAndAssign(payinDetails: CreatePaymentOrderDtoAdmin) {
    const {
      userId,
      userEmail,
      userName,
      userMobileNumber,
      orderId,
      amount,
      merchantId,
      memberId,
      channel,
    } = payinDetails;

    if (!merchantId || !memberId)
      throw new NotFoundException('Merchant ID or Member ID missing!');

    const merchant = await this.merchantRepository.findOne({
      where: {
        id: merchantId,
      },
      relations: ['identity'],
    });
    if (!merchant) throw new NotFoundException('Merchant not found!');

    let endUser = await this.endUserRepository.findOne({
      where: { userId, merchant: { id: merchant.id } },
      relations: ['merchant'],
    });

    if (endUser?.isBlacklisted)
      throw new NotAcceptableException('This user is currently blacklisted!');

    if (!endUser)
      endUser = await this.endUserService.create({
        email: userEmail,
        mobile: userMobileNumber,
        name: userName,
        channel,
        userId,
        merchant,
      });

    const payin = await this.payinRepository.save({
      merchantOrderId: orderId,
      user: endUser,
      systemOrderId: `PAYIN-${uniqid()}`.toUpperCase(),
      merchant,
      amount,
      channel,
    });

    if (payin)
      await this.transactionUpdateService.create({
        orderDetails: payin,
        orderType: OrderType.PAYIN,
        systemOrderId: payin.systemOrderId,
        userId: merchant.identity.id,
      });

    const member = await this.memberRepository.findOne({
      where: { id: memberId },
      relations: [
        'identity',
        'identity.upi',
        'identity.eWallet',
        'identity.netBanking',
      ],
    });

    const mapChannel = {
      E_WALLET: 'eWallet',
      NET_BANKING: 'netBanking',
      UPI: 'upi',
    };

    await this.updatePayinStatusToAssigned({
      id: payin.systemOrderId,
      userId: endUser.id,
      paymentMode: PaymentMadeOn.MEMBER,
      memberId: memberId,
      memberPaymentDetails: member?.identity?.[mapChannel[channel]][0],
    });

    return payin;
  }

  async createAndAssignSandbox(payinDetails: CreatePaymentOrderSandboxDto) {
    const {
      userId,
      userName,
      orderId,
      amount,
      channel,
      paymentMethod,
      merchantId,
    } = payinDetails;

    if (!merchantId) throw new NotFoundException('Merchant ID missing!');

    const merchant = await this.merchantRepository.findOne({
      where: {
        id: merchantId,
      },
      relations: ['identity'],
    });
    if (!merchant) throw new NotFoundException('Merchant not found!');

    const payin = await this.payinSandboxRepository.save({
      merchantOrderId: orderId,
      user: {
        name: userName,
        userId,
      },
      systemOrderId: `PAYIN-SANDBOX-${uniqid()}`.toUpperCase(),
      merchant: {
        id: merchant.id,
        name: merchant.firstName + ' ' + merchant.lastName,
      },
      amount,
      channel,
    });

    switch (paymentMethod) {
      case 'member':
        const memberPaymentDetails = {
          'Upi Id': 'karlpearson@upi',
          mobile: '9876543210',
        };

        await this.payinSandboxRepository.update(payin.id, {
          status: OrderStatus.ASSIGNED,
          member: {
            name: 'Karl Pearson',
          },
          payinMadeOn: PaymentMadeOn.MEMBER,
          transactionId: 'SANDBOX-TRNX-001ABC',
          transactionDetails: JSON.stringify(memberPaymentDetails),
        });
        break;

      case 'phonepe':
        await this.payinSandboxRepository.update(payin.id, {
          status: OrderStatus.ASSIGNED,
          gatewayName: GatewayName.PHONEPE,
        });
        break;

      case 'razorpay':
        await this.payinSandboxRepository.update(payin.id, {
          status: OrderStatus.ASSIGNED,
          gatewayName: GatewayName.RAZORPAY,
        });
        break;

      default:
        break;
    }

    return payin;
  }

  async updatePayinStatusToAssigned(body) {
    const {
      id,
      userId,
      paymentMode,
      memberId,
      gatewayServiceRate,
      memberPaymentDetails,
      gatewayName,
    } = body;

    if (
      paymentMode === PaymentMadeOn.GATEWAY &&
      (!gatewayServiceRate || !gatewayName)
    )
      throw new NotAcceptableException(
        'gateway service rate or gateway payment details missing!',
      );

    if (
      paymentMode === PaymentMadeOn.MEMBER &&
      (!memberId || !memberPaymentDetails)
    )
      throw new NotAcceptableException('memberId or payment details missing!');

    const payinOrderDetails = await this.payinRepository.findOne({
      where: { systemOrderId: id },
      relations: [
        'merchant',
        'member',
        'merchant.endUser',
        'merchant.endUser.payin',
      ],
    });
    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    if (payinOrderDetails.status !== OrderStatus.INITIATED)
      throw new NotAcceptableException('order status is not initiated!');

    if (paymentMode === PaymentMadeOn.GATEWAY) {
      const { endUserPayinLimit } = await this.systemConfigService.findLatest();

      const endUser = payinOrderDetails.merchant.endUser.find(
        (user) => (user.userId = userId),
      );

      if (endUser) {
        const currentTime = new Date();
        const twentyFourHoursAgo = new Date(
          currentTime.getTime() - 24 * 60 * 60 * 1000,
        );

        const totalPayinAmountUsingGateways = endUser.payin.reduce(
          (prev, curr) => {
            if (
              curr.payinMadeOn === PaymentMadeOn.GATEWAY &&
              new Date(curr.createdAt) >= twentyFourHoursAgo
            )
              prev += curr.amount;
            return prev;
          },
          0,
        );

        if (totalPayinAmountUsingGateways > endUserPayinLimit)
          await this.alertService.create({
            for: null,
            userType: Users.ADMIN,
            type: AlertType.USER_PAYIN_LIMIT,
            data: {
              id: endUser?.id,
              userId: endUser?.userId,
              userName: endUser?.name,
              userEmail: endUser?.email,
              userMobile: endUser?.mobile,
              payinAmount: endUser?.totalPayinAmount,
              payoutAmount: endUser?.totalPayoutAmount,
              merchant:
                payinOrderDetails?.merchant?.firstName +
                ' ' +
                payinOrderDetails?.merchant?.lastName,
              createdAt: payinOrderDetails?.createdAt,
              payinAmountUsingGateways: totalPayinAmountUsingGateways,
              currentPayinOrderAmount: payinOrderDetails.amount,
            },
          });
      }
    }

    let member;
    if (paymentMode === PaymentMadeOn.MEMBER)
      member = await this.memberRepository.findOne({
        where: { id: memberId },
        relations: ['identity'],
      });

    if (paymentMode === PaymentMadeOn.MEMBER) {
      await this.transactionUpdateService.create({
        orderDetails: payinOrderDetails,
        userId: member.identity.id,
        forMember: true,
        orderType: OrderType.PAYIN,
        systemOrderId: payinOrderDetails.systemOrderId,
      });
    }

    if (paymentMode === PaymentMadeOn.GATEWAY) {
      await this.transactionUpdateRepository.save({
        orderType: OrderType.PAYIN,
        userType: UserTypeForTransactionUpdates.GATEWAY_FEE,
        name: paymentMode,
        rate: gatewayServiceRate,
        amount: (payinOrderDetails.amount / 100) * gatewayServiceRate,
        before: 0,
        after: 0,
        payinOrder: payinOrderDetails,
      });

      await this.transactionUpdateService.addSystemProfit({
        orderDetails: payinOrderDetails,
        orderType: OrderType.PAYIN,
        systemOrderId: payinOrderDetails.systemOrderId,
        amount: 0,
      });
    }

    await this.payinRepository.update(
      { systemOrderId: id },
      {
        status: OrderStatus.ASSIGNED,
        payinMadeOn: paymentMode,
        member: paymentMode === PaymentMadeOn.MEMBER ? member : null,
        gatewayName: paymentMode === PaymentMadeOn.GATEWAY ? gatewayName : null,
        gatewayServiceRate:
          paymentMode === PaymentMadeOn.GATEWAY ? gatewayServiceRate : null,
        transactionDetails:
          paymentMode === PaymentMadeOn.MEMBER
            ? JSON.stringify(memberPaymentDetails)
            : null,
      },
    );
    return HttpStatus.OK;
  }

  async updatePayinStatusToSubmitted(body) {
    const { id, transactionId, transactionDetails } = body;

    if (!id) throw new NotAcceptableException('System order ID missing!');
    if (!transactionId)
      throw new NotAcceptableException('Transaction ID missing!');

    const payinOrderDetails = await this.payinRepository.findOne({
      where: {
        systemOrderId: id,
      },
      relations: ['member', 'member.identity'],
    });
    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    if (payinOrderDetails.status !== OrderStatus.ASSIGNED)
      throw new NotAcceptableException('order status is not assigned!');

    let updatedTransactionDetails = payinOrderDetails.transactionDetails;
    if (
      payinOrderDetails.payinMadeOn === PaymentMadeOn.GATEWAY &&
      transactionDetails
    ) {
      updatedTransactionDetails = JSON.stringify(transactionDetails); // Update only if payment is via gateway
    }

    await this.payinRepository.update(
      { systemOrderId: id },
      {
        status: OrderStatus.SUBMITTED,
        transactionId,
        transactionDetails: updatedTransactionDetails,
      },
    );

    if (payinOrderDetails.payinMadeOn === PaymentMadeOn.MEMBER) {
      await this.notificationService.create({
        for: payinOrderDetails.member?.id,
        type: NotificationType.PAYIN_FOR_VERIFY,
        data: {
          orderId: payinOrderDetails.systemOrderId,
          amount: payinOrderDetails.amount,
          channel: payinOrderDetails.channel,
        },
      });

      // Withheld
      const deductedQuota = -((payinOrderDetails.amount * 50) / 100);

      await this.memberService.updateQuota(
        payinOrderDetails.member.identity.id,
        payinOrderDetails.systemOrderId,
        deductedQuota,
        false,
        false,
      );
    }

    return HttpStatus.OK;
  }

  async updatePayinStatusToFailed(body) {
    const { id } = body;

    const payinOrderDetails = await this.payinRepository.findOneBy({
      systemOrderId: id,
    });
    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    if (payinOrderDetails.status !== OrderStatus.SUBMITTED)
      throw new NotAcceptableException(
        'order status is not submitted or already failed or completed!',
      );

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId: id,
          pending: true,
        },
        relations: ['payinOrder', 'user'],
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

      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_QUOTA) {
        // Release Withheld
        const addedQuota = (payinOrderDetails.amount * 50) / 100;
        await this.memberService.updateQuota(
          entry.user.id,
          entry.systemOrderId,
          addedQuota,
          false,
          false,
        );

        await this.memberService.updateQuota(
          entry.user.id,
          entry.systemOrderId,
          0,
          true,
        );
      }

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
          payinOrderDetails.systemOrderId,
          true,
        );

      await this.transactionUpdateRepository.update(entry.id, {
        pending: false,
      });
    });

    await this.payinRepository.update(
      { systemOrderId: id },
      { status: OrderStatus.FAILED },
    );

    return HttpStatus.OK;
  }

  async updatePayinStatusToComplete(body) {
    const { id } = body;

    const payinOrderDetails = await this.payinRepository.findOne({
      where: {
        systemOrderId: id,
      },
      relations: ['member', 'user', 'member.team'],
    });
    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    if (payinOrderDetails.status !== OrderStatus.SUBMITTED)
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
        const afterBalance = entry.after - entry.before;

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
        // Release Withheld
        const addedQuota = (payinOrderDetails.amount * 50) / 100;
        await this.memberService.updateQuota(
          entry.user.id,
          entry.systemOrderId,
          addedQuota,
          false,
          false,
        );

        const afterAmount = -(entry.before - entry.after);

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
      orderAmount: payinOrderDetails.amount,
      systemOrderId: payinOrderDetails.systemOrderId,
      orderType: OrderType.PAYIN,
    });

    await this.payinRepository.update(
      { systemOrderId: id },
      {
        status: OrderStatus.COMPLETE,
      },
    );

    const endUser = await this.endUserRepository.findOne({
      where: {
        id: payinOrderDetails.user.id,
      },
    });

    await this.endUserRepository.update(endUser.id, {
      totalPayinAmount: endUser.totalPayinAmount + payinOrderDetails.amount,
    });

    return HttpStatus.OK;
  }

  async findAll() {
    const payins = await this.payinRepository.find();

    return payins;
  }

  async handleCallbackStatusSuccess(systemOrderId, environment = 'live') {
    let payinOrderDetails;

    if (environment === 'live')
      payinOrderDetails = await this.payinRepository.findOneBy({
        systemOrderId,
      });

    if (environment === 'sandbox')
      payinOrderDetails = await this.payinSandboxRepository.findOneBy({
        systemOrderId,
      });

    if (!payinOrderDetails)
      throw new NotFoundException('Payin order not found.');

    if (payinOrderDetails.callbackStatus === CallBackStatus.SUCCESS)
      throw new NotAcceptableException(
        'Callback status is aready set to SUCCESS',
      );

    await this.payinRepository.update(payinOrderDetails.id, {
      callbackStatus: CallBackStatus.SUCCESS,
    });

    return HttpStatus.OK;
  }

  async removeOneDayOldSandboxPayins() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const oldPayins = await this.payinSandboxRepository.find({
      where: {
        createdAt: LessThan(oneDayAgo),
      },
    });

    if (oldPayins.length) await this.payinSandboxRepository.remove(oldPayins);
  }
}
