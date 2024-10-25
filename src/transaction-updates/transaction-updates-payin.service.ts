import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { AgentReferralService } from 'src/agent-referral/agent-referral.service';
import { Identity } from 'src/identity/entities/identity.entity';
import { MemberReferralService } from 'src/member-referral/member-referral.service';
import { SystemConfigService } from 'src/system-config/system-config.service';

@Injectable()
export class TransactionUpdatesPayinService {
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
    systemOrderId,
    forMember,
  ) {
    let userType = UserTypeForTransactionUpdates.MERCHANT_BALANCE;
    let before = 0,
      rate = 0, // service rate / commission rates
      amount = 0, // total service fee / commissions
      after = 0;

    if (forMember) {
      // Member Quota - member selected for payment
      if (!referral.children || referral.children.length <= 0) {
        userType = UserTypeForTransactionUpdates.MEMBER_QUOTA;
        rate = referral.payinCommission;
        amount = (orderAmount / 100) * rate;
        before = referral.quota;
        after = before - orderAmount + amount;
      } else {
        // agent members
        userType = UserTypeForTransactionUpdates.MEMBER_BALANCE;
        rate = referral.payinCommission;
        amount = (orderAmount / 100) * rate;
        before = referral.balance;
        after = before + amount;
      }
    } else {
      switch (referral.agentType) {
        case 'merchant':
          userType = UserTypeForTransactionUpdates.MERCHANT_BALANCE;
          rate = referral.merchantPayinServiceRate;
          amount = (orderAmount / 100) * rate;
          before = referral.balance;
          after = before + orderAmount - amount;
          break;

        case 'agent':
          userType = UserTypeForTransactionUpdates.AGENT_BALANCE;
          rate = referral.payinCommission;
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
      systemOrderId,
      user: identity,
    };

    await this.transactionUpdateRepository.save(transactionUpdate);

    // Recursively call the same for rest of the children
    if (referral.children && referral.children.length > 0)
      await this.processReferral(
        referral.children[0],
        orderType,
        orderAmount,
        orderDetails,
        systemOrderId,
        forMember,
      );
  }

  async addSystemProfit(orderDetails, orderType, systemOrderId) {
    const systemProfitExists = await this.transactionUpdateRepository.findOne({
      where: {
        userType: UserTypeForTransactionUpdates.SYSTEM_PROFIT,
        systemOrderId,
      },
      relations: ['payinOrder'],
    });
    if (systemProfitExists)
      await this.transactionUpdateRepository.remove(systemProfitExists);

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId,
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
          case UserTypeForTransactionUpdates.GATEWAY_FEE:
            acc.agentTotal += entry.amount;
            break;
          default:
            break;
        }
        return acc;
      },
      { merchantTotal: 0, memberTotal: 0, agentTotal: 0, gatewayTotal: 0 },
    );
    const afterProfit =
      profitFromCurrentOrder.merchantTotal -
      (profitFromCurrentOrder.memberTotal +
        profitFromCurrentOrder.agentTotal +
        profitFromCurrentOrder.gatewayTotal);

    await this.transactionUpdateRepository.save({
      orderType,
      userType: UserTypeForTransactionUpdates.SYSTEM_PROFIT,
      before: beforeProfit,
      amount: afterProfit - beforeProfit,
      after: afterProfit,
      payinOrder: orderDetails,
      systemOrderId,
    });
  }

  async create({
    orderDetails,
    orderType,
    userId,
    systemOrderId,
    forMember = false,
  }) {
    const { amount } = orderDetails;

    const referrals = forMember
      ? await this.memberReferralService.getReferralTreeOfUser(userId)
      : await this.agentReferralService.getReferralTreeOfUser(userId);

    await this.processReferral(
      referrals,
      orderType,
      amount,
      orderDetails,
      systemOrderId,
      forMember,
    );

    this.addSystemProfit(orderDetails, orderType, systemOrderId);

    return HttpStatus.CREATED;
  }
}
