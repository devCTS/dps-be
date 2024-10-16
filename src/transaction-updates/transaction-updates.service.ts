import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateTransactionUpdateDto } from './dto/create-transaction-update.dto';
import { UpdateTransactionUpdateDto } from './dto/update-transaction-update.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderType, UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { AgentReferralService } from 'src/agent-referral/agent-referral.service';
import { IdentityService } from 'src/identity/identity.service';
import { Identity } from 'src/identity/entities/identity.entity';
import { MemberReferralService } from 'src/member-referral/member-referral.service';

@Injectable()
export class TransactionUpdatesService {
  constructor(
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    private readonly agentReferralService: AgentReferralService,
    private readonly memberReferralService: MemberReferralService,
  ) {}

  async processReferral(referral, orderType, orderAmount, orderDetails) {
    let userType = UserTypeForTransactionUpdates.MERCHANT_BALANCE;
    let before = 0,
      rate = 2, // service rate / commission rates
      amount = 0, // total service fee / commissions
      after = 0;

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
            : referral.payoutCommission) ?? 2;
        amount = (orderAmount / 100) * rate;
        before = referral.balance;
        after = before + amount;
        break;

      case 'member':
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
          userType = UserTypeForTransactionUpdates.MEMBER_BALANCE;
          rate =
            orderType === OrderType.PAYIN
              ? referral.payinCommission
              : referral.payoutCommission;
          amount = (orderAmount / 100) * rate;
          before = referral.balance;
          after = before + amount;
        }

        break;
    }

    const identity = await this.identityRepository.findOne({
      where: { email: referral.email },
      relations: ['merchants', 'members', 'agent'],
    });

    const transactionUpdate = {
      orderType,
      userType,
      rate,
      amount,
      before,
      after,
      payinOrder: orderDetails,
      user: identity,
    };
    // system profit
    await this.transactionUpdateRepository.save(transactionUpdate);

    if (referral.children && referral.children.length > 0)
      await this.processReferral(
        referral.children[0],
        orderType,
        orderAmount,
        orderDetails,
      );
  }

  async create({ orderDetails, orderType, userId, forMember = false }) {
    const { amount } = orderDetails;

    const referrals = forMember
      ? await this.memberReferralService.getReferralTreeOfUser(userId)
      : await this.agentReferralService.getReferralTreeOfUser(userId);

    if (referrals)
      this.processReferral(referrals, orderType, amount, orderDetails);

    return HttpStatus.CREATED;
  }

  async updatePendingStatusToFalse(orderId, orderType: OrderType) {
    const transactionUpdates = await this.transactionUpdateRepository.find({
      where: { payinOrder: orderId, orderType, pending: true },
    });

    const transactionUpdateIds = transactionUpdates.map((el) => el.id);

    await this.transactionUpdateRepository.update(transactionUpdateIds, {
      pending: false,
    });
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
