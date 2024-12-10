import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { Identity } from 'src/identity/entities/identity.entity';
import { MemberReferralService } from 'src/member-referral/member-referral.service';
import { roundOffAmount } from 'src/utils/utils';
import { TransactionUpdatesService } from './transaction-updates.service';

@Injectable()
export class TransactionUpdatesTopupService {
  constructor(
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    private readonly memberReferralService: MemberReferralService,
    private readonly transactionUpdatesService: TransactionUpdatesService,
  ) {}

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
        ? element.topupCommissionRate
        : getAgentRates(prevElement).topup;
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
        topupOrder: orderDetails,
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
          topupOrder: orderDetails,
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
  // ) {
  //   let userType = UserTypeForTransactionUpdates.MERCHANT_BALANCE;
  //   let before = 0,
  //     rate = 0, // service rate / commission rates
  //     amount = 0, // total service fee / commissions
  //     after = 0;

  //   // Member Quota - member selected for payment
  //   if (!referral.children || referral.children.length <= 0) {
  //     userType = UserTypeForTransactionUpdates.MEMBER_QUOTA;
  //     rate = referral.topupCommission;
  //     amount = (orderAmount / 100) * rate;
  //     before = referral.quota;
  //     after = before + orderAmount + amount;
  //   } else {
  //     // agent members
  //     userType = UserTypeForTransactionUpdates.MEMBER_BALANCE;
  //     rate = referral.topupCommission;
  //     amount = (orderAmount / 100) * rate;
  //     before = referral.balance;
  //     after = before + amount;

  //     const identity = await this.identityRepository.findOne({
  //       where: { email: referral.email },
  //       relations: ['merchant', 'member', 'agent'],
  //     });

  //     // Add quota
  //     const transactionUpdate = {
  //       orderType,
  //       userType: UserTypeForTransactionUpdates.MEMBER_QUOTA,
  //       rate,
  //       amount: roundOffAmount((orderAmount / 100) * rate),
  //       before: roundOffAmount(referral.quota),
  //       after: roundOffAmount(referral.quota + amount),
  //       name: `${referral.firstName} ${referral.lastName}`,
  //       isAgentOf:
  //         referral.children?.length > 0
  //           ? `${referral.children[0]?.firstName} ${referral.children[0]?.lastName}`
  //           : null,
  //       isAgentMember: true,
  //       payoutOrder: orderDetails,
  //       systemOrderId,
  //       user: identity,
  //     };

  //     await this.transactionUpdateRepository.save(transactionUpdate);
  //   }

  //   const identity = await this.identityRepository.findOne({
  //     where: { email: referral.email },
  //     relations: ['member', 'agent'],
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
  //     topupOrder: orderDetails,
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
  //     );
  // }

  async create({ orderDetails, orderType, systemOrderId, userId = null }) {
    const { amount } = orderDetails;

    const referralList =
      await this.transactionUpdatesService.getMemberAgentsLine(userId);

    await this.processReferralMember(
      referralList,
      orderType,
      amount,
      orderDetails,
      systemOrderId,
    );

    return HttpStatus.CREATED;
  }
}
