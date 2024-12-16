import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Agent } from 'src/agent/entities/agent.entity';
import { Member } from 'src/member/entities/member.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Payin } from 'src/payin/entities/payin.entity';
import { Payout } from 'src/payout/entities/payout.entity';
import { Submerchant } from 'src/sub-merchant/entities/sub-merchant.entity';
import { Topup } from 'src/topup/entities/topup.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import {
  OrderStatus,
  OrderType,
  UserTypeForTransactionUpdates,
  WithdrawalOrderStatus,
} from 'src/utils/enum/enum';
import { monthNames, roundOffAmount } from 'src/utils/utils';
import { Withdrawal } from 'src/withdrawal/entities/withdrawal.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OverviewUserService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Submerchant)
    private readonly submerchantRepository: Repository<Submerchant>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Payin)
    private readonly payinRepository: Repository<Payin>,
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(Topup)
    private readonly topupRepository: Repository<Topup>,
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

    // Initialize the monthly commissions for the last 5 months including the current month
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
        const indexInCommissions = (currentMonthIndex - month + 12) % 12;

        if (
          indexInCommissions >= 0 &&
          indexInCommissions < monthlyCommissions.length
        ) {
          monthlyCommissions[indexInCommissions].Commissions += 1;
        }
      }
    });

    return {
      orders: {
        balance: agent.balance,
        withdrawalAmount: totalWithdrawalAmount,
        commissions: count,
        commissionAmount: totalCommissionAmount,
      },
      graphData: monthlyCommissions.reverse(),
    };
  }

  async getMerchantOverviewDetails(userId) {
    const merchant = await this.merchantRepository.findOne({
      where: { id: userId },
      relations: ['identity'],
    });
    if (!merchant) throw new NotFoundException('Merchant not found!');

    const withdrawals = await this.withdrawalRepository.find({
      where: {
        user: { id: merchant.identity.id },
        status: WithdrawalOrderStatus.COMPLETE,
      },
      relations: ['user'],
    });
    const totalWithdrawalAmount = withdrawals.reduce((prev, curr) => {
      return prev + curr.amount;
    }, 0);

    const [payinRows, payinsCount] = await this.payinRepository.findAndCount({
      where: {
        merchant: { id: merchant.id },
      },
      relations: ['merchant'],
    });

    const payins = payinRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) {
          prev.completed++;
          prev.income += curr.amount;
        } else if (curr.status === OrderStatus.FAILED) prev.failed++;
        else prev.pending++;

        return prev;
      },
      { pending: 0, completed: 0, failed: 0, income: 0 },
    );

    const [payoutRows, payoutsCount] = await this.payoutRepository.findAndCount(
      {
        where: {
          merchant: { id: merchant.id },
        },
        relations: ['merchant'],
      },
    );

    const payouts = payoutRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) {
          prev.completed++;
          prev.amount += curr.amount;
        } else if (curr.status === OrderStatus.FAILED) prev.failed++;
        else prev.pending++;

        return prev;
      },
      { pending: 0, completed: 0, failed: 0, amount: 0 },
    );

    const transactionUpdateRows = await this.transactionUpdateRepository
      .createQueryBuilder('transactionUpdate')
      .leftJoinAndSelect('transactionUpdate.user', 'user')
      .where('transactionUpdate.userType IN(:...userType)', {
        userType: [UserTypeForTransactionUpdates.MERCHANT_BALANCE],
      })
      .andWhere('transactionUpdate.user.id = :userId', {
        userId: merchant.identity.id,
      })
      .andWhere('transactionUpdate.pending = :pending', { pending: false })
      .andWhere('transactionUpdate.before != transactionUpdate.after')
      .getMany();

    const transactions = transactionUpdateRows.reduce(
      (prev, curr) => {
        if (curr.orderType === OrderType.PAYIN)
          prev.payinServiceFee += curr.amount;
        if (curr.orderType === OrderType.PAYOUT)
          prev.payoutServiceFee += curr.amount;
        return prev;
      },
      {
        payinServiceFee: 0,
        payoutServiceFee: 0,
      },
    );

    const currentMonthIndex = moment().month();
    const monthsOfYear = monthNames();
    const monthlyCommissions = [];

    // Initialize the monthly commissions for the last 5 months including the current month
    for (let i = 0; i < 5; i++) {
      const monthIndex = (currentMonthIndex - i + 12) % 12;
      monthlyCommissions.push({
        date: monthsOfYear[monthIndex],
        Payins: 0,
      });
    }

    payinRows.forEach((transaction) => {
      const month = moment(transaction.createdAt).month();

      if (
        month >= (currentMonthIndex - 4 + 12) % 12 &&
        month <= currentMonthIndex
      ) {
        const indexInCommissions = (currentMonthIndex - month + 12) % 12;

        if (
          indexInCommissions >= 0 &&
          indexInCommissions < monthlyCommissions.length
        ) {
          monthlyCommissions[indexInCommissions].Payins += 1;
        }
      }
    });

    return {
      payins: {
        totalOrders: payinsCount,
        ordersPending: payins.pending,
        ordersCompleted: payins.completed,
        ordersFailed: payins.failed,
        income: roundOffAmount(payins.income - transactions.payinServiceFee),
        serviceFee: roundOffAmount(transactions.payinServiceFee),
      },
      payouts: {
        totalOrders: payoutsCount,
        ordersPending: payouts.pending,
        ordersCompleted: payouts.completed,
        ordersFailed: payouts.failed,
        payoutAmount: roundOffAmount(
          payouts.amount + transactions.payoutServiceFee,
        ),
        serviceFee: roundOffAmount(transactions.payoutServiceFee),
      },
      balances: {
        withdrawal: roundOffAmount(totalWithdrawalAmount),
        balance: roundOffAmount(merchant.balance),
      },
      graphData: monthlyCommissions.reverse(),
    };
  }

  async getMemberOverviewDetails(userId) {
    const member = await this.memberRepository.findOne({
      where: { id: userId },
      relations: ['identity'],
    });
    if (!member) throw new NotFoundException('Member not found!');

    const withdrawals = await this.withdrawalRepository.find({
      where: {
        user: { id: member.identity.id },
        status: WithdrawalOrderStatus.COMPLETE,
      },
      relations: ['user'],
    });
    const totalWithdrawalAmount = withdrawals.reduce((prev, curr) => {
      return prev + curr.amount;
    }, 0);

    const payinRows = await this.payinRepository.find({
      where: {
        member: { id: member.id },
      },
      relations: ['member'],
    });

    const payins = payinRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) prev.completed++;
        else if (curr.status === OrderStatus.FAILED) null;
        else prev.pending++;

        return prev;
      },
      { pending: 0, completed: 0 },
    );

    const payoutRows = await this.payoutRepository.find({
      where: {
        member: { id: member.id },
      },
      relations: ['member', 'transactionUpdate', 'transactionUpdate.user'],
    });

    const payouts = payoutRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) prev.completed++;
        else if (curr.status === OrderStatus.FAILED) null;
        else prev.pending++;

        return prev;
      },
      { pending: 0, completed: 0 },
    );

    const topupRows = await this.topupRepository.find({
      where: {
        member: { id: member.id },
      },
      relations: ['member'],
    });

    const topups = topupRows.reduce(
      (prev, curr) => {
        if (curr.status === OrderStatus.COMPLETE) prev.completed++;
        else if (curr.status === OrderStatus.FAILED) null;
        else prev.pending++;

        return prev;
      },
      { pending: 0, completed: 0 },
    );

    const transactionUpdateRows = await this.transactionUpdateRepository
      .createQueryBuilder('transactionUpdate')
      .leftJoinAndSelect('transactionUpdate.user', 'user')
      .where('transactionUpdate.userType IN(:...userType)', {
        userType: [
          UserTypeForTransactionUpdates.MEMBER_BALANCE,
          UserTypeForTransactionUpdates.MEMBER_QUOTA,
        ],
      })
      .andWhere('transactionUpdate.user.id = :userId', {
        userId: member.identity.id,
      })
      .andWhere('transactionUpdate.pending = :pending', { pending: false })
      .andWhere('transactionUpdate.before != transactionUpdate.after')
      .getMany();

    const commissions = transactionUpdateRows.reduce(
      (prev, curr) => {
        if (curr.orderType === OrderType.PAYIN) prev.payin += curr.amount;
        if (curr.orderType === OrderType.PAYOUT) prev.payout += curr.amount;
        if (curr.orderType === OrderType.TOPUP) prev.topup += curr.amount;
        return prev;
      },
      {
        payin: 0,
        payout: 0,
        topup: 0,
      },
    );

    return {
      payins: {
        ordersPending: payins.pending,
        ordersCompleted: payins.completed,
        commission: roundOffAmount(commissions.payin),
      },
      payouts: {
        ordersPending: payouts.pending,
        ordersCompleted: payouts.completed,
        commission: roundOffAmount(commissions.payout),
      },
      topups: {
        ordersCompleted: topups.completed,
        commission: roundOffAmount(commissions.topup),
      },
      balances: {
        withdrawal: roundOffAmount(totalWithdrawalAmount),
        balance: roundOffAmount(member.balance),
        quota: roundOffAmount(member.quota),
      },
    };
  }
}
