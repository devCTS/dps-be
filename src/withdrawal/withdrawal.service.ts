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
import { Repository } from 'typeorm';
import * as uniqid from 'uniqid';
import {
  AlertType,
  ChannelName,
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
import { roundOffAmount } from 'src/utils/utils';
import { max } from 'class-validator';

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
      systemOrderId: uniqid(),
      user,
    });
    if (!createWithdrawalOrder)
      throw new InternalServerErrorException('Failed to create order!');

    return HttpStatus.CREATED;
  }

  async makeGatewayPayout(body) {
    const res = await this.paymentSystemService.makeGatewayPayout({
      ...body,
      orderType: OrderType.WITHDRAWAL,
    });

    if (res.paymentStatus === 'success')
      await this.updateStatusToComplete({
        id: body.orderId,
        transactionDetails: {
          transactionId: res.transactionId,
          transactionReceipt: res.transactionReceipt,
          gatewayDetails: res.transactionDetails,
        },
        withdrawalMadeOn: WithdrawalMadeOn.GATEWAY,
        gatewayName: res.gatewayName,
      });

    return HttpStatus.OK;
  }

  async updateStatusToComplete(body) {
    const { id, transactionDetails, withdrawalMadeOn, gatewayName } = body;

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
      transactionDetails: JSON.stringify(transactionDetails),
      withdrawalMadeOn,
      gatewayName:
        withdrawalMadeOn === WithdrawalMadeOn.GATEWAY ? gatewayName : null,
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
}
