import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { Agent } from 'src/agent/entities/agent.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import {
  OrderStatus,
  UserTypeForTransactionUpdates,
  WithdrawalOrderStatus,
} from 'src/utils/enum/enum';
import { monthNames } from 'src/utils/utils';
import { Withdrawal } from 'src/withdrawal/entities/withdrawal.entity';
import { Equal, Not, Repository } from 'typeorm';

@Injectable()
export class OverviewUserService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
  ) {}

  async getAgentOverviewDetails(userId) {
    const agent = await this.agentRepository.findOne({
      where: { id: userId },
      relations: ['identity'],
    });
    if (!agent) throw new NotFoundException('Agent not found!');

    const withdrawals = await this.withdrawalRepository.find({
      where: {
        user: { id: agent.identity.id },
        status: WithdrawalOrderStatus.COMPLETE,
      },
      relations: ['user'],
    });
    const totalWithdrawalAmount = withdrawals.reduce((prev, curr) => {
      return prev + curr.amount;
    }, 0);

    const [transactionUpdateRows, count] =
      await this.transactionUpdateRepository
        .createQueryBuilder('transactionUpdate')
        .leftJoinAndSelect('transactionUpdate.user', 'user')
        .where('transactionUpdate.userType = :userType', {
          userType: UserTypeForTransactionUpdates.AGENT_BALANCE,
        })
        .andWhere('transactionUpdate.user.id = :userId', {
          userId: agent.identity.id,
        })
        .andWhere('transactionUpdate.pending = :pending', { pending: false })
        .andWhere('transactionUpdate.before != transactionUpdate.after')
        .getManyAndCount();

    const totalCommissionAmount = transactionUpdateRows.reduce((prev, curr) => {
      return prev + curr.amount;
    }, 0);

    const currentMonthIndex = moment().month();
    const monthsOfYear = monthNames();
    const monthlyCommissions = [];

    for (let i = 0; i < 5; i++) {
      const monthIndex = (currentMonthIndex - i + 12) % 12;
      monthlyCommissions.push({
        date: monthsOfYear[monthIndex],
        Commissions: 0,
      });
    }

    transactionUpdateRows.forEach((transaction) => {
      const month = moment(transaction.createdAt).month();

      if (
        month >= (currentMonthIndex - 4 + 12) % 12 &&
        month <= currentMonthIndex
      ) {
        const monthIndex =
          (currentMonthIndex - ((currentMonthIndex - month + 12) % 12)) % 12;
        monthlyCommissions[monthIndex].Commissions += 1;
      }
    });

    return {
      orders: {
        balance: agent.balance,
        withdrawalAmount: totalWithdrawalAmount,
        commissions: count,
        commissionAmount: totalCommissionAmount,
      },
      graphData: monthlyCommissions,
    };
  }
}
