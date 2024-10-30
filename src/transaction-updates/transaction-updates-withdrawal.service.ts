import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GatewayName,
  UserTypeForTransactionUpdates,
  WithdrawalMadeOn,
} from 'src/utils/enum/enum';
import { AgentReferralService } from 'src/agent-referral/agent-referral.service';
import { Identity } from 'src/identity/entities/identity.entity';
import { MemberReferralService } from 'src/member-referral/member-referral.service';
import { SystemConfigService } from 'src/system-config/system-config.service';

@Injectable()
export class TransactionUpdatesWithdrawalService {
  constructor(
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async addSystemProfit(orderDetails, orderType, systemOrderId) {
    const systemProfitExists = await this.transactionUpdateRepository.findOne({
      where: {
        userType: UserTypeForTransactionUpdates.SYSTEM_PROFIT,
        systemOrderId,
      },
      relations: ['withdrawalOrder'],
    });
    if (systemProfitExists)
      await this.transactionUpdateRepository.remove(systemProfitExists);

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId,
          pending: false,
        },
        relations: ['withdrawalOrder'],
      });

    const systemConfig = await this.systemConfigService.findLatest();

    let beforeProfit = systemConfig.systemProfit;
    let amount = 0;

    transactionUpdateEntries.forEach((row) => {
      if (
        row.userType === UserTypeForTransactionUpdates.MEMBER_BALANCE ||
        row.userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE ||
        row.userType === UserTypeForTransactionUpdates.AGENT_BALANCE
      )
        amount = row.amount;

      if (row.userType === UserTypeForTransactionUpdates.GATEWAY_FEE)
        amount -= row.amount;
    });

    let after = beforeProfit + amount;

    await this.transactionUpdateRepository.save({
      orderType,
      userType: UserTypeForTransactionUpdates.SYSTEM_PROFIT,
      before: beforeProfit,
      amount,
      after,
      withdrawalOrder: orderDetails,
      systemOrderId,
      pending: false,
    });
  }

  async create({
    orderDetails,
    orderType,
    systemOrderId,
    userRole,
    withdrawalMadeOn,
    user,
    gatewayName = GatewayName.PHONEPE,
  }) {
    const mapUserType = {
      MEMBER: UserTypeForTransactionUpdates.MEMBER_BALANCE,
      MERCHANT: UserTypeForTransactionUpdates.MERCHANT_BALANCE,
      AGENT: UserTypeForTransactionUpdates.AGENT_BALANCE,
      gateway_fee: UserTypeForTransactionUpdates.GATEWAY_FEE,
    };

    const rate =
      withdrawalMadeOn === WithdrawalMadeOn.ADMIN
        ? 0
        : user.withdrawalServiceRate;
    const amount =
      withdrawalMadeOn === WithdrawalMadeOn.ADMIN
        ? 0
        : (orderDetails.amount / 100) * rate; // Withdrawal service rate
    const before = user.balance;
    const after =
      withdrawalMadeOn === WithdrawalMadeOn.ADMIN
        ? user.balance - orderDetails.amount
        : user.balance - (orderDetails.amount - amount); // Deduct Withdrawal service rate

    const transactionUpdate = {
      orderType,
      userType: mapUserType[userRole],
      rate,
      amount,
      before,
      after,
      name:
        userRole === UserTypeForTransactionUpdates.GATEWAY_FEE
          ? gatewayName
          : `${user.firstName} ${user.lastName}`,
      withdrawalOrder: orderDetails,
      systemOrderId,
      user: orderDetails.user,
      pending: false,
    };

    await this.transactionUpdateRepository.save(transactionUpdate);

    await this.addSystemProfit(orderDetails, orderType, systemOrderId);

    return HttpStatus.CREATED;
  }
}
