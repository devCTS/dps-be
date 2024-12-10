import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { Identity } from 'src/identity/entities/identity.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';
import {
  calculateServiceAmountForMerchant,
  roundOffAmount,
} from 'src/utils/utils';
import { TransactionUpdatesService } from './transaction-updates.service';

@Injectable()
export class TransactionUpdatesPayinService {
  constructor(
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,

    private readonly systemConfigService: SystemConfigService,
    private readonly transactionUpdatesService: TransactionUpdatesService,
  ) {}

  async processReferralMerchant(
    referralList,
    orderType,
    orderAmount,
    orderDetails,
    systemOrderId,
  ) {
    const getAgentRates = (referee) => {
      return {
        payin: referee.agentCommissions?.payinCommissionRate,
        payout: referee.agentCommissions?.payoutCommissionRate,
      };
    };

    for (let i = 0; i < referralList.length; i++) {
      const element = referralList[i];
      const prevElement = i > 0 ? referralList[i - 1] : null;

      const identity = await this.identityRepository.findOne({
        where: { email: element.email },
      });

      const isMerchant = element.isMerchant;
      const userType = isMerchant
        ? UserTypeForTransactionUpdates.MERCHANT_BALANCE
        : UserTypeForTransactionUpdates.AGENT_BALANCE;
      const isAgentOf = prevElement
        ? prevElement?.firstName + ' ' + prevElement?.lastName
        : null;
      const name = element.firstName + ' ' + element.lastName;

      const rate = isMerchant
        ? element.payinServiceRate?.percentageAmount
        : getAgentRates(prevElement).payout;

      const absoluteAmount = isMerchant
        ? element.payinServiceRate?.absoluteAmount
        : 0;

      const amount = isMerchant
        ? calculateServiceAmountForMerchant(
            orderAmount,
            element.payinServiceRate,
          )
        : (orderAmount / 100) * rate;

      const before = element.balance;

      const after = isMerchant
        ? before + orderAmount - amount
        : before + amount;

      const transactionUpdate = {
        orderType,
        userType,
        rate,
        absoluteAmount,
        amount: roundOffAmount(amount),
        before: roundOffAmount(before),
        after: roundOffAmount(after),
        name,
        isAgentOf,
        payinOrder: orderDetails,
        systemOrderId,
        user: identity,
      };

      await this.transactionUpdateRepository.save(transactionUpdate);
    }
  }

  async processReferralMember(
    referralList,
    orderType,
    orderAmount,
    orderDetails,
    systemOrderId,
  ) {
    const getAgentRates = (referee) => {
      return {
        payin: referee.agentCommissions?.payinCommissionRate,
        payout: referee.agentCommissions?.payoutCommissionRate,
        topup: referee.agentCommissions?.topupCommissionRate,
      };
    };

    for (let i = 0; i < referralList.length; i++) {
      const element = referralList[i];
      const prevElement = i > 0 ? referralList[i - 1] : null;
      const isAgent = i !== 0;

      const identity = await this.identityRepository.findOne({
        where: { email: element.identity.email },
      });

      const name = element?.firstName + ' ' + element?.lastName;
      const userType = UserTypeForTransactionUpdates.MEMBER_QUOTA;

      const rate = !isAgent
        ? element.payinCommissionRate
        : getAgentRates(prevElement).payin;
      const amount = (orderAmount / 100) * rate;
      const before = element.quota;
      const after = !isAgent ? before - orderAmount + amount : before + amount;
      const isAgentOf = prevElement
        ? prevElement?.firstName + ' ' + prevElement?.lastName
        : null;
      const isAgentMember = isAgent;

      const transactionUpdate = {
        orderType,
        userType,
        rate,
        amount: roundOffAmount(amount),
        before: roundOffAmount(before),
        after: roundOffAmount(after),
        name,
        isAgentOf,
        isAgentMember,
        payinOrder: orderDetails,
        systemOrderId,
        user: identity,
      };

      await this.transactionUpdateRepository.save(transactionUpdate);

      if (isAgent) {
        // insert row twice for agents - quota and balance
        const agentTransactionUpdate = {
          orderType,
          userType: UserTypeForTransactionUpdates.MEMBER_BALANCE,
          rate,
          amount: roundOffAmount(amount),
          before: element.balance,
          after: element.balance + amount,
          name,
          isAgentOf,
          isAgentMember,
          payinOrder: orderDetails,
          systemOrderId,
          user: identity,
        };

        await this.transactionUpdateRepository.save(agentTransactionUpdate);
      }
    }
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
          case UserTypeForTransactionUpdates.MEMBER_QUOTA:
            acc.memberQuota += entry.amount;
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
      {
        merchantTotal: 0,
        memberTotal: 0,
        memberQuota: 0,
        agentTotal: 0,
        gatewayTotal: 0,
      },
    );
    const currentProfit =
      profitFromCurrentOrder.merchantTotal -
      (profitFromCurrentOrder.memberTotal +
        profitFromCurrentOrder.agentTotal +
        profitFromCurrentOrder.gatewayTotal +
        profitFromCurrentOrder.memberQuota);

    await this.transactionUpdateRepository.save({
      orderType,
      userType: UserTypeForTransactionUpdates.SYSTEM_PROFIT,
      before: roundOffAmount(beforeProfit),
      amount: roundOffAmount(currentProfit),
      after: roundOffAmount(beforeProfit + currentProfit),
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

    if (forMember) {
      const referralList =
        await this.transactionUpdatesService.getMemberAgentsLine(userId);

      await this.processReferralMember(
        referralList,
        orderType,
        amount,
        orderDetails,
        systemOrderId,
      );
    } else {
      const referralList =
        await this.transactionUpdatesService.getMerchantAgentsLine(userId);

      await this.processReferralMerchant(
        referralList,
        orderType,
        amount,
        orderDetails,
        systemOrderId,
      );
    }

    await this.addSystemProfit(orderDetails, orderType, systemOrderId);

    return HttpStatus.CREATED;
  }
}
