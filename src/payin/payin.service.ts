import { identity } from 'rxjs';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as uniqid from 'uniqid';
import { Payin } from './entities/payin.entity';
import {
  CallBackStatus,
  OrderStatus,
  OrderType,
  PaymentMadeOn,
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
import { CreatePaymentOrderDto } from 'src/payment-system/dto/createPaymentOrder.dto';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { ChangeCallbackStatusDto } from './dto/change-callback-status.dto';

@Injectable()
export class PayinService {
  constructor(
    @InjectRepository(Payin)
    private readonly payinRepository: Repository<Payin>,
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
  ) {}

  async create(payinDetails: CreatePaymentOrderDto) {
    const {
      userId,
      userEmail,
      userName,
      userMobileNumber,
      channel,
      integrationId,
      orderId,
      amount,
    } = payinDetails;

    let endUser = await this.endUserRepository.findOneBy({ userId });

    if (!endUser) {
      try {
        endUser = await this.endUserService.create({
          email: userEmail,
          mobile: userMobileNumber,
          name: userName,
          channel,
          userId,
        });
        if (!endUser)
          throw new InternalServerErrorException('Unable to create end-user!');
      } catch (e) {
        console.log(e.toString());
      }
    }

    const merchant = await this.merchantRepository.findOneBy({
      integrationId,
    });
    if (!merchant)
      throw new InternalServerErrorException('Merchant not found!');

    const payin = await this.payinRepository.save({
      merchantOrderId: orderId,
      user: endUser,
      systemOrderId: uniqid(),
      merchant,
      amount,
      channel,
    });

    if (payin)
      await this.transactionUpdateService.create({
        orderDetails: payin,
        orderType: OrderType.PAYIN,
        systemOrderId: payin.systemOrderId,
        userId: merchant.id,
      });

    return payin;
  }

  async updatePayinStatusToAssigned(body) {
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

    const payinOrderDetails = await this.payinRepository.findOne({
      where: { systemOrderId: id },
      relations: ['merchant', 'member'],
    });
    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    if (payinOrderDetails.status !== OrderStatus.INITIATED)
      throw new NotAcceptableException('order status is not initiated!');

    let member;
    if (paymentMode === PaymentMadeOn.MEMBER)
      member = await this.memberRepository.findOne({
        where: { id: memberId },
        relations: ['identity'],
      });

    if (paymentMode === PaymentMadeOn.MEMBER) {
      await this.transactionUpdateService.create({
        orderDetails: payinOrderDetails,
        userId: memberId,
        forMember: true,
        orderType: OrderType.PAYIN,
        systemOrderId: payinOrderDetails.systemOrderId,
      });

      // Withheld
      const deductedQuota = -((payinOrderDetails.amount * 50) / 100);

      await this.memberService.updateQuota(
        member.identity.id,
        payinOrderDetails.systemOrderId,
        deductedQuota,
        false,
        false,
      );
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

      await this.transactionUpdateService.addSystemProfit(
        payinOrderDetails,
        OrderType.PAYIN,
        payinOrderDetails.systemOrderId,
      );
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
    const { id, transactionId, transactionReceipt } = body;

    if (!transactionId && !transactionReceipt)
      throw new NotAcceptableException('Transaction ID or receipt missing!');

    const payinOrderDetails = await this.payinRepository.findOneBy({
      systemOrderId: id,
    });

    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    if (payinOrderDetails.status !== OrderStatus.ASSIGNED)
      throw new NotAcceptableException('order status is not assigned!');

    await this.payinRepository.update(
      { systemOrderId: id },
      {
        status: OrderStatus.SUBMITTED,
        transactionId,
        transactionReceipt,
      },
    );

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
      relations: ['member'],
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
      if (entry.userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE)
        await this.merchantService.updateBalance(
          entry.user.id,
          entry.systemOrderId,
          entry.after,
          false,
        );

      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_BALANCE)
        await this.memberService.updateBalance(
          entry.user.id,
          entry.systemOrderId,
          entry.after,
          false,
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
          entry.after,
          false,
        );
      }

      if (entry.userType === UserTypeForTransactionUpdates.AGENT_BALANCE)
        await this.agentService.updateBalance(
          entry.user.id,
          entry.systemOrderId,
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

    await this.payinRepository.update(
      { systemOrderId: id },
      {
        status: OrderStatus.COMPLETE,
      },
    );

    return HttpStatus.OK;
  }

  async findAll() {
    const payins = await this.payinRepository.find();

    return payins;
  }

  findOne(id: number) {
    return `This action returns a #${id} payout`;
  }

  remove(id: number) {
    return `This action removes a #${id} payout`;
  }

  async changeCallbackStatus(changeCallbackStatusDto: ChangeCallbackStatusDto) {
    const { systemOrderId, callbackStatus } = changeCallbackStatusDto;
    const payinOrderDetails = await this.payinRepository.findOneBy({
      systemOrderId,
    });

    if (!payinOrderDetails)
      throw new NotFoundException('Payin order not found.');

    if (payinOrderDetails.callbackStatus === CallBackStatus.SUCCESS)
      throw new NotAcceptableException(
        'Callback status is aready set to SUCCESS',
      );

    await this.payinRepository.update(payinOrderDetails.id, { callbackStatus });

    return HttpStatus.OK;
  }
}
