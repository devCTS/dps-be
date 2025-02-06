import { FundRecordService } from 'src/fund-record/fund-record.service';
import { TransactionUpdatesWithdrawalService } from './../transaction-updates/transaction-updates-withdrawal.service';
import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { In, Repository } from 'typeorm';
import uniqid from 'uniqid';
import {
  AlertType,
  ChannelName,
  GatewayName,
  NotificationStatus,
  OrderType,
  Users,
  UserTypeForTransactionUpdates,
  WithdrawalMadeOn,
  WithdrawalOrderStatus,
} from 'src/utils/enum/enum';
import { Identity } from 'src/identity/entities/identity.entity';
import { IdentityService } from 'src/identity/identity.service';
import { MemberService } from 'src/member/member.service';
import { MerchantService } from 'src/merchant/merchant.service';
import { AgentService } from 'src/agent/agent.service';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { PaymentSystemService } from 'src/payment-system/payment-system.service';
import { AlertService } from 'src/alert/alert.service';
import { mapAndGetGatewayPayoutStatus, roundOffAmount } from 'src/utils/utils';
import { RazorpayService } from 'src/payment-system/razorpay/razorpay.service';
import { UniqpayService } from 'src/payment-system/uniqpay/uniqpay.service';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,

    private readonly identityService: IdentityService,
    private readonly transactionUpdatesWithdrawalService: TransactionUpdatesWithdrawalService,
    private readonly memberService: MemberService,
    private readonly merchantService: MerchantService,
    private readonly agentService: AgentService,
    private readonly systemConfigService: SystemConfigService,
    private readonly fundRecordService: FundRecordService,
    @Inject(forwardRef(() => AlertService))
    private readonly alertService: AlertService,
    @Inject(forwardRef(() => PaymentSystemService))
    private readonly paymentSystemService: PaymentSystemService,
    private readonly razorpayService: RazorpayService,
    private readonly uniqpayService: UniqpayService,
  ) {}

  async create(createWithdrawalDto: CreateWithdrawalDto, email) {
    const {
      channel,
      channelDetails,
      withdrawalAmount,
      // email
    } = createWithdrawalDto;

    const user = await this.identityRepository.findOne({
      where: {
        email,
      },
      relations: ['merchant', 'agent'],
    });
    if (!user) throw new NotFoundException('User not found!');

    const isMerchant = user?.merchant;

    const minWithdrawalAmountOfUser = isMerchant
      ? user.merchant?.minWithdrawal
      : user.agent?.minWithdrawalAmount;

    const maxWithdrawalAmountOfUser = isMerchant
      ? user.merchant?.maxWithdrawal
      : user.agent?.maxWithdrawalAmount;

    const currentAvailableBalance =
      await this.identityService.getCurrentBalalnce(user.email);

    if (currentAvailableBalance < withdrawalAmount)
      return {
        error: true,
        message: 'Your current available balance is not sufficient!',
      };

    if (
      withdrawalAmount < minWithdrawalAmountOfUser ||
      withdrawalAmount > maxWithdrawalAmountOfUser
    )
      return {
        error: true,
        message: `Min Payout Amount - ${minWithdrawalAmountOfUser} | Max payout Amount - ${maxWithdrawalAmountOfUser}`,
      };

    const channelMap = {
      UPI: ChannelName.UPI,
      NETBANKING: ChannelName.BANKING,
      EWALLET: ChannelName.E_WALLET,
    };

    const createWithdrawalOrder = await this.withdrawalRepository.save({
      channel: channelMap[channel],
      channelDetails,
      amount: withdrawalAmount,
      systemOrderId: `WITHDRAWAL-${uniqid()}`.toUpperCase(),
      user,
    });
    if (!createWithdrawalOrder)
      throw new InternalServerErrorException('Failed to create order!');

    return HttpStatus.CREATED;
  }

  async makeGatewayPayout(body) {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: {
        systemOrderId: body.orderId,
      },
      relations: ['user'],
    });
    if (!withdrawal) throw new NotFoundException('Withdrawal order not found!');

    let mode;
    if (withdrawal.channel === ChannelName.UPI) mode = 'UPI';
    if (withdrawal.channel === ChannelName.E_WALLET) mode = 'E_WALLET';
    if (withdrawal.channel === ChannelName.BANKING) mode = 'IMPS';

    const res = await this.paymentSystemService.makeGatewayPayout({
      identityId: withdrawal?.user?.id,
      amount: withdrawal.amount,
      orderId: withdrawal.systemOrderId,
      mode,
      orderType: OrderType.WITHDRAWAL,
      forInternalUsers: true,
    });

    if (!res)
      throw new NotFoundException(
        'No payment gateway is available at the moment!',
      );

    const mappedStatus = mapAndGetGatewayPayoutStatus(
      res.gatewayName,
      res.paymentStatus,
    );

    if (mappedStatus === 'PENDING')
      await this.withdrawalRepository.update(withdrawal.id, {
        transactionId: res.transactionId,
        transactionReceipt: res.transactionReceipt,
        transactionDetails: res.transactionDetails,
        gatewayName: res.gatewayName,
        withdrawalMadeOn: WithdrawalMadeOn.GATEWAY,
      });

    if (mappedStatus === 'SUCCESS')
      await this.updateStatusToComplete({
        id: body.orderId,
        transactionId: res.transactionId,
        transactionReceipt: res.transactionReceipt,
        transactionDetails: res.transactionDetails,
        withdrawalMadeOn: WithdrawalMadeOn.GATEWAY,
        gatewayName: res.gatewayName,
      });

    if (mappedStatus === 'FAILED')
      await this.updateStatusToFailed({
        id: body.orderId,
      });

    return HttpStatus.OK;
  }

  async updateStatusToComplete(body) {
    const {
      id,
      transactionId,
      transactionReceipt,
      transactionDetails,
      withdrawalMadeOn,
      gatewayName,
    } = body;

    const orderDetails = await this.withdrawalRepository.findOne({
      where: {
        systemOrderId: id,
      },
      relations: ['user'],
    });
    if (!orderDetails) throw new NotFoundException('Order not found!');

    const user = await this.identityService.getUser(
      orderDetails.user.id,
      orderDetails.user.userType,
    );

    if (withdrawalMadeOn === WithdrawalMadeOn.ADMIN)
      await this.transactionUpdatesWithdrawalService.create({
        orderDetails,
        orderType: OrderType.WITHDRAWAL,
        systemOrderId: orderDetails.systemOrderId,
        userRole: orderDetails.user.userType,
        withdrawalMadeOn: WithdrawalMadeOn.ADMIN,
        user,
      });

    if (withdrawalMadeOn === WithdrawalMadeOn.GATEWAY) {
      await this.transactionUpdatesWithdrawalService.create({
        orderDetails,
        orderType: OrderType.WITHDRAWAL,
        systemOrderId: orderDetails.systemOrderId,
        userRole: orderDetails.user.userType,
        withdrawalMadeOn: WithdrawalMadeOn.GATEWAY,
        user,
      });

      await this.transactionUpdatesWithdrawalService.create({
        orderDetails,
        orderType: OrderType.WITHDRAWAL,
        systemOrderId: orderDetails.systemOrderId,
        userRole: UserTypeForTransactionUpdates.GATEWAY_FEE,
        withdrawalMadeOn: WithdrawalMadeOn.GATEWAY,
        user,
        gatewayName,
      });
    }

    await this.withdrawalRepository.update(orderDetails.id, {
      status: WithdrawalOrderStatus.COMPLETE,
      transactionId: orderDetails.transactionId || transactionId,
      transactionReceipt: orderDetails.transactionReceipt || transactionReceipt,
      transactionDetails:
        orderDetails.transactionDetails || JSON.stringify(transactionDetails),
      withdrawalMadeOn: orderDetails.withdrawalMadeOn || withdrawalMadeOn,
      gatewayName:
        orderDetails.gatewayName ||
        withdrawalMadeOn === WithdrawalMadeOn.GATEWAY
          ? gatewayName
          : null,
    });

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId: id,
        },
        relations: ['user'],
      });

    transactionUpdateEntries.forEach(async (entry) => {
      if (entry.userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE) {
        const afterAmount = -(entry.before - entry.after);
        await this.merchantService.updateBalance(
          entry.user.id,
          entry.systemOrderId,
          afterAmount,
          false,
        );
      }

      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_BALANCE) {
        const afterAmount = -(entry.before - entry.after);
        await this.memberService.updateBalance(
          entry.user.id,
          entry.systemOrderId,
          afterAmount,
          false,
        );
      }

      if (entry.userType === UserTypeForTransactionUpdates.AGENT_BALANCE) {
        const afterAmount = -(entry.before - entry.after);

        await this.agentService.updateBalance(
          entry.user.id,
          entry.systemOrderId,
          afterAmount,
          false,
        );
      }

      if (entry.userType === UserTypeForTransactionUpdates.SYSTEM_PROFIT)
        await this.systemConfigService.updateSystemProfit(
          entry.amount,
          entry.systemOrderId,
          false,
        );
    });

    await this.fundRecordService.addFundRecordForSuccessOrder({
      systemOrderId: orderDetails.systemOrderId,
      orderAmount: orderDetails.amount,
      orderType: OrderType.WITHDRAWAL,
    });

    const mapUserType = {
      MERCHANT: Users.MERCHANT,
      AGENT: Users.AGENT,
      MEMBER: Users.MEMBER,
    };

    const { withdrawalRate } = await this.systemConfigService.findLatest();

    await this.alertService.create({
      for: user?.id,
      userType: mapUserType[orderDetails.user.userType],
      type: AlertType.WITHDRAWAL_COMPLETE,
      data: {
        orderId: orderDetails.systemOrderId,
        amount: orderDetails.amount,
        channel: orderDetails.channel,
        serviceFee: roundOffAmount(
          (orderDetails.amount / 100) * withdrawalRate,
        ),
      },
    });

    return HttpStatus.OK;
  }

  async updateStatusToRejected(body) {
    const { id } = body;

    const orderDetails = await this.withdrawalRepository.findOne({
      where: {
        systemOrderId: id,
      },
      relations: ['user'],
    });
    if (!orderDetails) throw new NotFoundException('Order not found!');

    const user = await this.identityService.getUser(
      orderDetails.user.id,
      orderDetails.user.userType,
    );

    await this.transactionUpdatesWithdrawalService.create({
      orderDetails,
      orderType: OrderType.WITHDRAWAL,
      systemOrderId: orderDetails.systemOrderId,
      userRole: orderDetails.user.userType,
      withdrawalMadeOn: WithdrawalMadeOn.ADMIN,
      user,
      failed: true,
    });

    await this.withdrawalRepository.update(orderDetails.id, {
      status: WithdrawalOrderStatus.REJECTED,
    });

    const mapUserType = {
      MERCHANT: Users.MERCHANT,
      AGENT: Users.AGENT,
      MEMBER: Users.MEMBER,
    };

    const { withdrawalRate } = await this.systemConfigService.findLatest();

    await this.alertService.create({
      for: user.id,
      userType: mapUserType[orderDetails.user.userType],
      type: AlertType.WITHDRAWAL_REJECTED,
      data: {
        orderId: orderDetails.systemOrderId,
        amount: orderDetails.amount,
        channel: orderDetails.channel,
        serviceFee: roundOffAmount(
          (orderDetails.amount / 100) * withdrawalRate,
        ),
      },
    });

    return HttpStatus.OK;
  }

  async updateStatusToFailed(body) {
    const { id } = body;

    const orderDetails = await this.withdrawalRepository.findOne({
      where: {
        systemOrderId: id,
      },
      relations: ['user'],
    });
    if (!orderDetails) throw new NotFoundException('Order not found!');

    const user = await this.identityService.getUser(
      orderDetails.user.id,
      orderDetails.user.userType,
    );

    await this.transactionUpdatesWithdrawalService.create({
      orderDetails,
      orderType: OrderType.WITHDRAWAL,
      systemOrderId: orderDetails.systemOrderId,
      userRole: orderDetails.user.userType,
      withdrawalMadeOn: WithdrawalMadeOn.GATEWAY,
      user,
      failed: true,
    });

    await this.transactionUpdatesWithdrawalService.create({
      orderDetails,
      orderType: OrderType.WITHDRAWAL,
      systemOrderId: orderDetails.systemOrderId,
      userRole: UserTypeForTransactionUpdates.GATEWAY_FEE,
      withdrawalMadeOn: WithdrawalMadeOn.GATEWAY,
      user,
      gatewayName: orderDetails?.gatewayName,
      failed: true,
    });

    await this.withdrawalRepository.update(orderDetails.id, {
      status: WithdrawalOrderStatus.FAILED,
    });

    const mapUserType = {
      MeERCHANT: Users.MERCHANT,
      AGENT: Users.AGENT,
      MEMBER: Users.MEMBER,
    };

    const { withdrawalRate } = await this.systemConfigService.findLatest();

    await this.alertService.create({
      for: user.id,
      userType: mapUserType[orderDetails.user.userType],
      type: AlertType.WITHDRAWAL_REJECTED,
      data: {
        orderId: orderDetails.systemOrderId,
        amount: orderDetails.amount,
        channel: orderDetails.channel,
        serviceFee: roundOffAmount(
          (orderDetails.amount / 100) * withdrawalRate,
        ),
      },
    });

    return HttpStatus.OK;
  }

  async handleNotificationStatusSuccess(systemOrderId: string) {
    const withdrawaOrderDetails = await this.withdrawalRepository.findOne({
      where: {
        systemOrderId,
      },
    });

    if (!withdrawaOrderDetails)
      throw new NotFoundException('Order details not found');

    await this.withdrawalRepository.update(withdrawaOrderDetails.id, {
      notificationStatus: NotificationStatus.SUCCESS,
    });

    return HttpStatus.OK;
  }

  async fetchPendingWithdrawalsAndUpdateStatus() {
    const pendingWithdrawals = await this.withdrawalRepository.findBy({
      status: WithdrawalOrderStatus.PENDING,
      withdrawalMadeOn: WithdrawalMadeOn.GATEWAY,
    });
    if (!pendingWithdrawals.length) return;

    pendingWithdrawals.forEach(async (withdrawal) => {
      if (withdrawal.transactionId) {
        let response;

        if (withdrawal.gatewayName === GatewayName.RAZORPAY)
          response = await this.razorpayService.getPayoutDetails(
            withdrawal.transactionId,
          );

        if (withdrawal.gatewayName === GatewayName.UNIQPAY)
          response = await this.uniqpayService.getPayoutDetails(
            withdrawal.transactionId,
          );

        const mappedStatus = mapAndGetGatewayPayoutStatus(
          withdrawal.gatewayName,
          response?.status,
        );

        if (mappedStatus === 'SUCCESS')
          await this.updateStatusToComplete({
            id: withdrawal.systemOrderId,
            transactionId: null,
            transactionReceipt: null,
            transactionDetails: null,
            withdrawalMadeOn: WithdrawalMadeOn.GATEWAY,
            gatewayName: null,
          });

        if (mappedStatus === 'FAILED')
          await this.updateStatusToFailed({
            id: withdrawal.systemOrderId,
          });
      }
    });
  }
}
