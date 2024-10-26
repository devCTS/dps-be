import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { Repository } from 'typeorm';

import {
  OrderStatus,
  OrderType,
  PaymentMadeOn,
  UserTypeForTransactionUpdates,
} from 'src/utils/enum/enum';
import { EndUserService } from 'src/end-user/end-user.service';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import * as uniqid from 'uniqid';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { TransactionUpdatesPayoutService } from 'src/transaction-updates/transaction-updates-payout.service';
import { Member } from 'src/member/entities/member.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { MemberService } from 'src/member/member.service';
import { MerchantService } from 'src/merchant/merchant.service';
import { AgentService } from 'src/agent/agent.service';
import { SystemConfigService } from 'src/system-config/system-config.service';

@Injectable()
export class PayoutService {
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
  ) {}

  async create(payoutDetails: CreatePayoutDto) {
    const { name, email, merchantId, channelDetails, channel, mobile } =
      payoutDetails;

    let endUserData = await this.endUserRepository.findOneBy({ email });

    if (!endUserData) {
      endUserData = await this.endUserService.create({
        email,
        channelDetails,
        channel,
        mobile,
        name,
        userId: uniqid(),
      });
    }

    const merchant = await this.merchantRepository.findOneBy({
      id: merchantId,
    });

    const payout = await this.payoutRepository.save({
      ...payoutDetails,
      user: endUserData,
      merchant,
      systemOrderId: uniqid(),
    });

    if (!payout) throw new InternalServerErrorException('Payout error');

    if (payout)
      await this.transactionUpdatePayoutService.create({
        orderDetails: payout,
        orderType: OrderType.PAYOUT,
        userId: merchantId,
        systemOrderId: payout.systemOrderId,
      });

    return HttpStatus.CREATED;
  }

  async updatePayoutStatusToAssigned(body) {
    const {
      id,
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

    const payoutOrderDetails = await this.payoutRepository.findOne({
      where: { systemOrderId: id },
      relations: ['merchant'],
    });

    if (!payoutOrderDetails) throw new NotFoundException('Order not found');

    if (payoutOrderDetails.status !== OrderStatus.INITIATED)
      throw new NotAcceptableException('order status is not initiated!');

    let member;
    if (paymentMode === PaymentMadeOn.MEMBER)
      member = await this.memberRepository.findOneBy({ id: memberId });

    if (paymentMode === PaymentMadeOn.MEMBER)
      await this.transactionUpdatePayoutService.create({
        orderDetails: payoutOrderDetails,
        userId: memberId,
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

      await this.transactionUpdatePayoutService.addSystemProfit(
        payoutOrderDetails,
        OrderType.PAYOUT,
        payoutOrderDetails.systemOrderId,
      );
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
            ? JSON.stringify(memberPaymentDetails)
            : null,
      },
    );

    return HttpStatus.OK;
  }

  async updatePayoutStatusToComplete(body) {
    const { id } = body;
    const payoutOrderDetails = await this.payoutRepository.findOneBy({
      systemOrderId: id,
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
          entry.amount,
          entry.systemOrderId,
          false,
        );

      await this.transactionUpdateRepository.update(entry.id, {
        pending: false,
      });
    });

    await this.payoutRepository.update(
      { systemOrderId: id },
      {
        status: OrderStatus.COMPLETE,
      },
    );

    return HttpStatus.OK;
  }

  async updatePayoutStatusToFailed(body) {
    const { id } = body;

    const payoutOrderDetails = await this.payoutRepository.findOneBy({
      systemOrderId: id,
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
        relations: ['payinOrder', 'user'],
      });

    transactionUpdateEntries.forEach(async (entry) => {
      if (entry.userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE)
        await this.merchantService.updateBalance(entry.user.id, 0, true);

      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_BALANCE)
        await this.memberService.updateBalance(entry.user.id, 0, true);

      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_QUOTA)
        await this.memberService.updateQuota(entry.user.id, 0, true);

      if (entry.userType === UserTypeForTransactionUpdates.AGENT_BALANCE)
        await this.agentService.updateBalance(entry.user.id, 0, true);

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

    return HttpStatus.OK;
  }

  async updatePayoutStatusToSubmitted(body) {
    const { id, transactionId, transactionReceipt } = body;

    if (!transactionId && !transactionReceipt)
      throw new NotAcceptableException('Transaction ID or receipt missing!');

    const payoutOrderDetails = await this.payoutRepository.findOneBy({
      systemOrderId: id,
    });

    if (!payoutOrderDetails) throw new NotFoundException('Order not found');

    if (payoutOrderDetails.status !== OrderStatus.ASSIGNED)
      throw new NotAcceptableException('order status is not assigned!');

    await this.payoutRepository.update(
      { systemOrderId: id },
      {
        status: OrderStatus.SUBMITTED,
        transactionId,
        transactionReceipt,
      },
    );

    return HttpStatus.OK;
  }

  findAll() {
    return `This action returns all payout`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payout`;
  }

  update(id: number, updatePayoutDto: UpdatePayoutDto) {
    return `This action updates a #${id} payout`;
  }

  remove(id: number) {
    return `This action removes a #${id} payout`;
  }
}
