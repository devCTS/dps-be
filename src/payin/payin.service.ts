import {
  HttpStatus,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payin } from './entities/payin.entity';
import {
  OrderStatus,
  OrderType,
  PaymentMadeOn,
  UserTypeForTransactionUpdates,
} from 'src/utils/enum/enum';
import { TransactionUpdatesService } from 'src/transaction-updates/transaction-updates.service';
import { EndUserService } from 'src/end-user/end-user.service';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { Member } from 'src/member/entities/member.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { Agent } from 'src/agent/entities/agent.entity';
import { MemberService } from 'src/member/member.service';
import { MerchantService } from 'src/merchant/merchant.service';
import { AgentService } from 'src/agent/agent.service';

@Injectable()
export class PayinService {
  constructor(
    @InjectRepository(Payin)
    private readonly payinRepository: Repository<Payin>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,

    private readonly transactionUpdateService: TransactionUpdatesService,
    private readonly endUserService: EndUserService,
    private readonly systemConfigService: SystemConfigService,
    private readonly memberService: MemberService,
    private readonly merchantService: MerchantService,
    private readonly agentService: AgentService,
  ) {}

  async create(payinDetails) {
    const { user, merchantId } = payinDetails;

    const endUser = await this.endUserService.create({
      ...user,
    });

    const merchant = await this.merchantRepository.findOneBy({
      id: merchantId,
    });

    const systemConfig = await this.systemConfigService.findLatest(false);

    const merchantCharge =
      (payinDetails.amount / 100) * merchant.payinServiceRate;

    const systemProfit = merchantCharge + systemConfig.systemProfit;

    const payin = await this.payinRepository.save({
      ...payinDetails,
      user: endUser,
      merchantCharge,
      systemProfit,
      merchant,
    });

    if (payin)
      await this.transactionUpdateService.create({
        orderDetails: payin,
        orderType: OrderType.PAYIN,
        userId: merchantId,
      });

    return HttpStatus.CREATED;
  }

  async updatePayinStatusToAssigned(body) {
    const {
      id,
      paymentMode,
      memberId,
      gatewayServiceRate,
      memberPaymentDetails,
      gatewayPaymentDetails,
    } = body;

    if (
      paymentMode === PaymentMadeOn.GATEWAY &&
      !gatewayServiceRate &&
      !gatewayPaymentDetails
    )
      throw new NotAcceptableException(
        'gateway service rate or payment details missing!',
      );

    if (
      paymentMode === PaymentMadeOn.MEMBER &&
      !memberId &&
      !memberPaymentDetails
    )
      throw new NotAcceptableException('memberId or payment details missing!');

    const payinOrderDetails = await this.payinRepository.findOne({
      where: { id },
      relations: ['merchant', 'member'],
    });
    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    let member;
    if (paymentMode === PaymentMadeOn.MEMBER)
      member = await this.memberRepository.findOneBy({ id: memberId });

    if (payinOrderDetails.payinMadeOn === PaymentMadeOn.MEMBER)
      await this.transactionUpdateService.create({
        orderDetails: payinOrderDetails,
        userId: memberId,
        forMember: true,
        orderType: OrderType.PAYIN,
      });

    if (payinOrderDetails.payinMadeOn === PaymentMadeOn.GATEWAY) {
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
      await this.transactionUpdateService.addSystemProfit(
        payinOrderDetails,
        OrderType.PAYIN,
      );
    }

    await this.payinRepository.update(id, {
      status: OrderStatus.ASSIGNED,
      payinMadeOn: paymentMode,
      member: paymentMode === PaymentMadeOn.MEMBER ? member : null,
      gatewayName: paymentMode === PaymentMadeOn.GATEWAY ? paymentMode : null,
      gatewayServiceRate:
        paymentMode === PaymentMadeOn.GATEWAY ? gatewayServiceRate : null,
      transactionDetails:
        paymentMode === PaymentMadeOn.GATEWAY
          ? JSON.stringify(gatewayPaymentDetails)
          : JSON.stringify(memberPaymentDetails),
    });
    return HttpStatus.OK;
  }

  async updatePayinStatusToSubmitted(body) {
    const { id, transactionId, transactionReceipt } = body;

    if (!transactionId && !transactionReceipt)
      throw new NotAcceptableException('Transaction ID or receipt missing!');

    const payinOrderDetails = await this.payinRepository.findOneBy({ id });

    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    await this.payinRepository.update(id, {
      status: OrderStatus.SUBMITTED,
      transactionId,
      transactionReceipt,
    });

    return HttpStatus.OK;
  }

  async updatePayinStatusToFailed(body) {
    const { id } = body;

    const payinOrderDetails = await this.payinRepository.findOneBy({ id });
    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          payinOrder: id,
          pending: true,
        },
        relations: ['user'],
      });

    transactionUpdateEntries.forEach(async (entry) => {
      if (entry.userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE)
        await this.merchantService.updateBalance(
          entry.user.id,
          entry.after,
          true,
        );

      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_BALANCE)
        await this.memberService.updateBalance(
          entry.user.id,
          entry.after,
          true,
        );

      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_QUOTA)
        await this.memberService.updateQuota(entry.user.id, entry.after, false);

      if (entry.userType === UserTypeForTransactionUpdates.AGENT_BALANCE)
        await this.agentService.updateBalance(entry.user.id, entry.after, true);

      if (entry.userType === UserTypeForTransactionUpdates.SYSTEM_PROFIT)
        await this.systemConfigService.updateSystemProfit(0, true, id);

      await this.transactionUpdateRepository.update(entry, {
        pending: false,
      });
    });

    await this.payinRepository.update(id, { status: OrderStatus.FAILED });

    return HttpStatus.OK;
  }

  async updatePayinStatusToComplete(body) {
    const { id } = body;
    const payinOrderDetails = await this.payinRepository.findOneBy({ id });
    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    const transactionUpdate = await this.transactionUpdateRepository.findOne({
      where: {
        payinOrder: { id },
        userType: UserTypeForTransactionUpdates.SYSTEM_PROFIT,
        pending: true,
      },
    });

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          payinOrder: { id },
          pending: true,
        },
        relations: ['user'],
      });

    transactionUpdateEntries.forEach(async (entry) => {
      if (entry.userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE)
        await this.merchantService.updateBalance(
          entry.user.id,
          entry.after,
          false,
        );

      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_BALANCE)
        await this.memberService.updateBalance(
          entry.user.id,
          entry.after,
          false,
        );

      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_QUOTA)
        await this.memberService.updateQuota(entry.user.id, entry.after, false);

      if (entry.userType === UserTypeForTransactionUpdates.AGENT_BALANCE)
        await this.agentService.updateBalance(
          entry.user.id,
          entry.after,
          false,
        );

      if (entry.userType === UserTypeForTransactionUpdates.SYSTEM_PROFIT)
        await this.systemConfigService.updateSystemProfit(
          transactionUpdate.amount,
          false,
          id,
        );

      await this.transactionUpdateRepository.update(entry, {
        pending: false,
      });
    });

    await this.payinRepository.update(id, {
      status: OrderStatus.COMPLETE,
    });

    return HttpStatus.OK;
  }

  findAll() {
    return `This action returns all payout`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payout`;
  }

  remove(id: number) {
    return `This action removes a #${id} payout`;
  }
}
