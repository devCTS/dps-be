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
import { Team } from 'src/team/entities/team.entity';

@Injectable()
export class TransactionUpdatesPayoutService {
  constructor(
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,

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

    let currentOrderSystemProfit = 0;
    let merchantAgentsBaseAmount = 0;

    for (let i = 0; i < referralList.length; i++) {
      const element = referralList[i];
      const prevElement = i > 0 ? referralList[i - 1] : null;

      const identity = await this.identityRepository.findOne({
        where: { email: element.identity.email },
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
        ? element.payoutServiceRate?.percentageAmount
        : getAgentRates(prevElement).payout;

      const rateText = isMerchant
        ? `${rate}% of ₹${orderAmount}`
        : `${rate}% of ₹${merchantAgentsBaseAmount}`;

      const absoluteAmount = isMerchant
        ? element.payoutServiceRate?.absoluteAmount
        : 0;

      const amount = isMerchant
        ? calculateServiceAmountForMerchant(
            orderAmount,
            element.payoutServiceRate,
          )
        : (merchantAgentsBaseAmount / 100) * rate;

      const before = element.balance;

      const after = isMerchant
        ? before - orderAmount - amount
        : before + amount;

      const transactionUpdate = {
        orderType,
        userType,
        rate,
        rateText,
        absoluteAmount,
        amount: roundOffAmount(amount),
        before: roundOffAmount(before),
        after: roundOffAmount(after),
        name,
        isAgentOf,
        payoutOrder: orderDetails,
        systemOrderId,
        user: identity,
      };

      await this.transactionUpdateRepository.save(transactionUpdate);

      if (isMerchant) {
        const { payoutSystemProfitRate } =
          await this.systemConfigService.findLatest();
        currentOrderSystemProfit = (amount / 100) * payoutSystemProfitRate;
        merchantAgentsBaseAmount = currentOrderSystemProfit;
      } else {
        currentOrderSystemProfit -= amount;
      }
    }

    await this.addSystemProfit({
      orderDetails,
      orderType,
      systemOrderId,
      amount: currentOrderSystemProfit,
    });
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

    const getMemberRates = async (teamId) => {
      let team;
      if (teamId) team = await this.teamRepository.findOneBy({ teamId });
      if (team?.teamPayoutCommissionRate > 0)
        return team?.teamPayoutCommissionRate;

      return (await this.systemConfigService.findLatest())
        ?.payoutCommissionRateForMember;
    };

    const { amount: merchantFee } =
      await this.transactionUpdateRepository.findOne({
        where: {
          systemOrderId,
          userType: UserTypeForTransactionUpdates.MERCHANT_BALANCE,
        },
      });

    const { payoutSystemProfitRate } =
      await this.systemConfigService.findLatest();

    let remainingMerchantFee =
      merchantFee - (merchantFee / 100) * payoutSystemProfitRate;
    let systemProfit = remainingMerchantFee;

    for (let i = 0; i < referralList.length; i++) {
      const element = referralList[i];
      const prevElement = i > 0 ? referralList[i - 1] : null;
      const isAgent = i !== 0;

      const identity = await this.identityRepository.findOne({
        where: { email: element.identity.email },
      });

      const name = element.firstName + ' ' + element.lastName;
      const userType = UserTypeForTransactionUpdates.MEMBER_QUOTA;

      const rate = !isAgent
        ? await getMemberRates(element?.teamId)
        : getAgentRates(prevElement).payout;

      const rateText = !isAgent
        ? `${rate}% of ₹${merchantFee}`
        : `${rate}% of ₹${remainingMerchantFee}`;

      const amount = !isAgent
        ? (merchantFee / 100) * rate
        : (remainingMerchantFee / 100) * rate;

      const before = element.quota;

      const after = !isAgent ? before + orderAmount + amount : before + amount;

      const isAgentOf = prevElement
        ? prevElement?.firstName + ' ' + prevElement?.lastName
        : null;
      const isAgentMember = isAgent;

      const transactionUpdate = {
        orderType,
        userType,
        rate,
        rateText,
        amount: roundOffAmount(amount),
        before: roundOffAmount(before),
        after: roundOffAmount(after),
        name,
        isAgentOf,
        isAgentMember,
        payoutOrder: orderDetails,
        systemOrderId,
        user: identity,
      };

      await this.transactionUpdateRepository.save(transactionUpdate);
      if (!isAgent) remainingMerchantFee -= amount;
      systemProfit -= amount;

      if (isAgent) {
        const agentTransactionUpdate = {
          orderType,
          userType: UserTypeForTransactionUpdates.MEMBER_BALANCE,
          rate,
          rateText,
          amount: roundOffAmount(amount),
          before: element.balance,
          after: element.balance + amount,
          name,
          isAgentOf,
          isAgentMember,
          payoutOrder: orderDetails,
          systemOrderId,
          user: identity,
        };

        await this.transactionUpdateRepository.save(agentTransactionUpdate);
      }
    }

    if (systemProfit > 0)
      await this.addSystemProfit({
        orderDetails,
        orderType,
        systemOrderId,
        amount: systemProfit,
        forUpdate: true,
      });
  }

  async addSystemProfit({
    orderDetails,
    orderType,
    systemOrderId,
    amount,
    forUpdate = false,
  }) {
    const systemProfitExists = await this.transactionUpdateRepository.findOne({
      where: {
        userType: UserTypeForTransactionUpdates.SYSTEM_PROFIT,
        systemOrderId,
      },
      relations: ['payoutOrder'],
    });
    if (systemProfitExists)
      await this.transactionUpdateRepository.remove(systemProfitExists);

    const { systemProfit } = await this.systemConfigService.findLatest();

    let beforeProfit = systemProfit;

    const currentAmount = forUpdate
      ? amount + systemProfitExists.amount
      : amount;

    await this.transactionUpdateRepository.save({
      orderType,
      userType: UserTypeForTransactionUpdates.SYSTEM_PROFIT,
      before: roundOffAmount(beforeProfit),
      amount: roundOffAmount(currentAmount),
      after: roundOffAmount(beforeProfit + currentAmount),
      payoutOrder: orderDetails,
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

    return HttpStatus.CREATED;
  }
}
