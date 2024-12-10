import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateTransactionUpdateDto } from './dto/update-transaction-update.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { AgentReferralService } from 'src/agent-referral/agent-referral.service';
import { Identity } from 'src/identity/entities/identity.entity';
import { MemberReferralService } from 'src/member-referral/member-referral.service';
import { SystemConfigService } from 'src/system-config/system-config.service';
import {
  calculateServiceAmountForMerchant,
  roundOffAmount,
} from 'src/utils/utils';
import { TransactionUpdatesService } from './transaction-updates.service';

@Injectable()
export class TransactionUpdatesPayoutService {
  constructor(
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    private readonly agentReferralService: AgentReferralService,
    private readonly memberReferralService: MemberReferralService,
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

      const userType = UserTypeForTransactionUpdates.MERCHANT_BALANCE;
      const isMerchant = element.isMerchant;
      const isAgentOf = prevElement
        ? prevElement?.firstName + ' ' + prevElement?.lastName
        : null;
      const name = element.firstName + ' ' + element.lastName;

      const rate = isMerchant
        ? element.payoutServiceRate?.percentageAmount
        : getAgentRates(prevElement).payout;

      const absoluteAmount = isMerchant
        ? element.payoutServiceRate?.absoluteAmount
        : 0;

      const amount = isMerchant
        ? calculateServiceAmountForMerchant(
            orderAmount,
            element.payoutServiceRate,
          )
        : (orderAmount / 100) * rate;

      const before = element.balance;

      const after = isMerchant
        ? before - orderAmount - amount
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
        payoutOrder: orderDetails,
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

      const name = element.firstName + ' ' + element.lastName;
      const userType = UserTypeForTransactionUpdates.MEMBER_QUOTA;

      const rate = !isAgent
        ? element.payoutCommissionRate
        : getAgentRates(prevElement).payout;
      const amount = (orderAmount / 100) * rate;
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

      if (isAgent) {
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
          payoutOrder: orderDetails,
          systemOrderId,
          user: identity,
        };

        await this.transactionUpdateRepository.save(agentTransactionUpdate);
      }
    }
  }

  // async processReferral(
  //   referral,
  //   orderType,
  //   orderAmount,
  //   orderDetails,
  //   systemOrderId,
  //   forMember,
  // ) {
  //   let userType = UserTypeForTransactionUpdates.MERCHANT_BALANCE;
  //   let before = 0,
  //     rate = 0, // service rate / commission rates
  //     amount = 0, // total service fee / commissions
  //     after = 0,
  //     absoluteAmount = 0;
  //   let isAgentMember = null;

  //   if (forMember) {
  //     // Member Quota - member selected for payment
  //     if (!referral.children || referral.children.length <= 0) {
  //       userType = UserTypeForTransactionUpdates.MEMBER_QUOTA;
  //       rate = referral.payoutCommission;
  //       amount = (orderAmount / 100) * rate;
  //       before = referral.quota;
  //       after = before + orderAmount + amount;
  //     } else {
  //       // agent members
  //       userType = UserTypeForTransactionUpdates.MEMBER_BALANCE;
  //       rate = referral.payoutCommission;
  //       amount = (orderAmount / 100) * rate;
  //       before = referral.balance;
  //       after = before + amount;
  //       isAgentMember = true;

  //       const identity = await this.identityRepository.findOne({
  //         where: { email: referral.email },
  //         relations: ['merchant', 'member', 'agent'],
  //       });

  //       // Add quota
  //       const transactionUpdate = {
  //         orderType,
  //         userType: UserTypeForTransactionUpdates.MEMBER_QUOTA,
  //         rate,
  //         amount: roundOffAmount((orderAmount / 100) * rate),
  //         before: roundOffAmount(referral.quota),
  //         after: roundOffAmount(referral.quota + amount),
  //         name: `${referral.firstName} ${referral.lastName}`,
  //         isAgentOf:
  //           referral.children?.length > 0
  //             ? `${referral.children[0]?.firstName} ${referral.children[0]?.lastName}`
  //             : null,
  //         isAgentMember: true,
  //         payoutOrder: orderDetails,
  //         systemOrderId,
  //         user: identity,
  //       };

  //       await this.transactionUpdateRepository.save(transactionUpdate);
  //     }
  //   } else {
  //     switch (referral.agentType) {
  //       case 'merchant':
  //         userType = UserTypeForTransactionUpdates.MERCHANT_BALANCE;
  //         rate = referral.merchantPayoutServiceRate?.percentageAmount || 0;
  //         absoluteAmount =
  //           referral.merchantPayoutServiceRate?.asoluteAmount || 0;
  //         amount = calculateServiceAmountForMerchant(
  //           orderAmount,
  //           referral.merchantPayoutServiceRate,
  //         );
  //         before = referral.balance;
  //         after = before - orderAmount - amount;
  //         break;

  //       case 'agent':
  //         userType = UserTypeForTransactionUpdates.AGENT_BALANCE;
  //         rate = referral.payoutCommission ?? 0.5;
  //         amount = (orderAmount / 100) * rate;
  //         before = referral.balance;
  //         after = before + amount;
  //         break;

  //       default:
  //         break;
  //     }
  //   }

  //   const identity = await this.identityRepository.findOne({
  //     where: { email: referral.email },
  //     relations: ['merchant', 'member', 'agent'],
  //   });

  //   const transactionUpdate = {
  //     orderType,
  //     userType,
  //     rate,
  //     amount: roundOffAmount(amount),
  //     before: roundOffAmount(before),
  //     after: roundOffAmount(after),
  //     name: `${referral.firstName} ${referral.lastName}`,
  //     isAgentOf:
  //       referral.children?.length > 0
  //         ? `${referral.children[0]?.firstName} ${referral.children[0]?.lastName}`
  //         : null,
  //     payoutOrder: orderDetails,
  //     isAgentMember,
  //     systemOrderId,
  //     user: identity,
  //   };

  //   await this.transactionUpdateRepository.save(transactionUpdate);

  //   if (referral.children && referral.children.length > 0)
  //     await this.processReferral(
  //       referral.children[0],
  //       orderType,
  //       orderAmount,
  //       orderDetails,
  //       systemOrderId,
  //       forMember,
  //     );
  // }

  async addSystemProfit(orderDetails, orderType, systemOrderId) {
    const systemProfitExists = await this.transactionUpdateRepository.findOne({
      where: {
        userType: UserTypeForTransactionUpdates.SYSTEM_PROFIT,
        systemOrderId,
      },
      relations: ['payoutOrder'],
    });
    if (systemProfitExists)
      await this.transactionUpdateRepository.remove(systemProfitExists);

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId,
          pending: true,
        },
        relations: ['payoutOrder'],
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
      after: roundOffAmount(currentProfit + beforeProfit),
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

    this.addSystemProfit(orderDetails, orderType, systemOrderId);

    return HttpStatus.CREATED;
  }
}
