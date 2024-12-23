import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { Identity } from 'src/identity/entities/identity.entity';
import { roundOffAmount } from 'src/utils/utils';
import { TransactionUpdatesService } from './transaction-updates.service';
import { Team } from 'src/team/entities/team.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';

@Injectable()
export class TransactionUpdatesTopupService {
  constructor(
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,

    private readonly transactionUpdatesService: TransactionUpdatesService,
    private readonly systemConfigService: SystemConfigService,
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

    const getMemberRates = async (teamId) => {
      let team;
      if (teamId) team = await this.teamRepository.findOneBy({ teamId });
      if (team?.teamTopupCommissionRate > 0)
        return team?.teamTopupCommissionRate;

      return (await this.systemConfigService.findLatest())
        ?.topupCommissionRateForMember;
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
        ? await getMemberRates(element?.teamId)
        : getAgentRates(prevElement).topup;

      const rateText = `${rate}% of ₹${orderAmount}`;

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
        rateText,
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
          rateText,
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
