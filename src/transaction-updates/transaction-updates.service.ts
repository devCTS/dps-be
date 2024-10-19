import { SystemConfig } from './../system-config/entities/system-config.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateTransactionUpdateDto } from './dto/create-transaction-update.dto';
import { UpdateTransactionUpdateDto } from './dto/update-transaction-update.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OrderStatus,
  OrderType,
  UserTypeForTransactionUpdates,
} from 'src/utils/enum/enum';
import { AgentReferralService } from 'src/agent-referral/agent-referral.service';
import { Identity } from 'src/identity/entities/identity.entity';
import { MemberReferralService } from 'src/member-referral/member-referral.service';
import { SystemConfigService } from 'src/system-config/system-config.service';

@Injectable()
export class TransactionUpdatesService {
  constructor(
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    private readonly agentReferralService: AgentReferralService,
    private readonly memberReferralService: MemberReferralService,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async processReferral(
    referral,
    orderType,
    orderAmount,
    orderDetails,
    forMember,
  ) {
    let userType = UserTypeForTransactionUpdates.MERCHANT_BALANCE;
    let before = 0,
      rate = 0.5, // service rate / commission rates
      amount = 0, // total service fee / commissions
      after = 0;

    if (forMember) {
      // Member Quota - member selected for payment
      if (!referral.children || referral.children.length <= 0) {
        userType = UserTypeForTransactionUpdates.MEMBER_QUOTA;
        rate =
          orderType === OrderType.PAYIN
            ? referral.payinCommission
            : referral.payoutCommission;
        amount = (orderAmount / 100) * rate;
        before = referral.quota;
        after =
          orderType === OrderType.PAYIN
            ? before - orderAmount + amount
            : before + orderAmount + amount;
      } else {
        // agent members
        userType = UserTypeForTransactionUpdates.MEMBER_BALANCE;
        rate =
          orderType === OrderType.PAYIN
            ? referral.payinCommission
            : referral.payoutCommission;
        amount = (orderAmount / 100) * rate;
        before = referral.balance;
        after = before + amount;
      }
    } else {
      switch (referral.agentType) {
        case 'merchant':
          userType = UserTypeForTransactionUpdates.MERCHANT_BALANCE;
          rate =
            orderType === OrderType.PAYIN
              ? referral.merchantPayinServiceRate
              : referral.merchantPayoutServiceRate;
          amount = (orderAmount / 100) * rate;
          before = referral.balance;
          after =
            orderType === OrderType.PAYIN
              ? before + orderAmount - amount
              : before - orderAmount - amount;
          break;

        case 'agent':
          userType = UserTypeForTransactionUpdates.AGENT_BALANCE;
          rate =
            (orderType === OrderType.PAYIN
              ? referral.payinCommission
              : referral.payoutCommission) ?? 0.5;
          amount = (orderAmount / 100) * rate;
          before = referral.balance;
          after = before + amount;
          break;

        default:
          break;
      }
    }

    const identity = await this.identityRepository.findOne({
      where: { email: referral.email },
      relations: ['merchant', 'member', 'agent'],
    });

    const transactionUpdate = {
      orderType,
      userType,
      rate,
      amount,
      before,
      after,
      name: `${referral.firstName} ${referral.lastName}`,
      isAgentOf:
        referral.children?.length > 0
          ? `${referral.children[0]?.firstName} ${referral.children[0]?.lastName}`
          : null,
      payinOrder: orderDetails,
      user: identity,
    };

    await this.transactionUpdateRepository.save(transactionUpdate);

    if (referral.children && referral.children.length > 0)
      await this.processReferral(
        referral.children[0],
        orderType,
        orderAmount,
        orderDetails,
        forMember,
      );
  }

  async addSystemProfit(orderDetails, orderType) {
    const systemProfitExists = await this.transactionUpdateRepository.findOne({
      where: {
        userType: UserTypeForTransactionUpdates.SYSTEM_PROFIT,
        payinOrder: orderDetails.id,
      },
    });
    if (systemProfitExists)
      await this.transactionUpdateRepository.remove(systemProfitExists);

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          payinOrder: { id: orderDetails.id },
          pending: true,
        },
        relations: ['payinOrder'],
      });

    const systemConfig = await this.systemConfigService.findLatest();

    let beforeProfit = systemConfig.systemProfit;
    let profitFromCurrentOrder = transactionUpdateEntries.reduce(
      (acc, entry) => {
        switch (entry.userType) {
          case UserTypeForTransactionUpdates.MERCHANT_BALANCE:
            acc.merchantTotal += entry.amount;
            break;
          case UserTypeForTransactionUpdates.MEMBER_BALANCE:
            acc.memberTotal += entry.amount;
            break;
          case UserTypeForTransactionUpdates.AGENT_BALANCE:
            acc.agentTotal += entry.amount;
            break;
          default:
            break;
        }
        return acc;
      },
      { merchantTotal: 0, memberTotal: 0, agentTotal: 0 },
    );
    const afterProfit =
      profitFromCurrentOrder.merchantTotal -
      (profitFromCurrentOrder.memberTotal + profitFromCurrentOrder.agentTotal);

    await this.transactionUpdateRepository.save({
      orderType,
      userType: UserTypeForTransactionUpdates.SYSTEM_PROFIT,
      before: beforeProfit,
      amount: profitFromCurrentOrder.merchantTotal,
      after: afterProfit,
      payinOrder: orderDetails,
    });
  }

  async create({ orderDetails, orderType, userId, forMember = false }) {
    const { amount } = orderDetails;

    const referrals = forMember
      ? await this.memberReferralService.getReferralTreeOfUser(userId)
      : await this.agentReferralService.getReferralTreeOfUser(userId);

    if (referrals) {
      await this.processReferral(
        referrals,
        orderType,
        amount,
        orderDetails,
        forMember,
      );
      this.addSystemProfit(orderDetails, orderType);
    }

    return HttpStatus.CREATED;
  }

  findAll() {
    return `This action returns all transactionUpdates`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transactionUpdate`;
  }

  update(id: number, updateTransactionUpdateDto: UpdateTransactionUpdateDto) {
    return `This action updates a #${id} transactionUpdate`;
  }

  remove(id: number) {
    return `This action removes a #${id} transactionUpdate`;
  }
}
