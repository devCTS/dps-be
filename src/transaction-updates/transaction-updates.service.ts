import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateTransactionUpdateDto } from './dto/create-transaction-update.dto';
import { UpdateTransactionUpdateDto } from './dto/update-transaction-update.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderType, UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { AgentReferralService } from 'src/agent-referral/agent-referral.service';

@Injectable()
export class TransactionUpdatesService {
  constructor(
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    private readonly agentReferralService: AgentReferralService,
  ) {}

  async processReferral(referral, orderType, payinAmount, orderDetails) {
    let userType = UserTypeForTransactionUpdates.MERCHANT_BALANCE;
    let before = referral.balance || 0;
    let rate =
      (orderType === OrderType.PAYIN
        ? referral.payinCommission
        : referral.payoutCommission) || 2;
    let amount = (payinAmount * rate) / 100;
    let after = before + payinAmount - amount;

    switch (referral.agentType) {
      case 'merchant':
        userType = UserTypeForTransactionUpdates.MERCHANT_BALANCE;
        break;
      case 'agent':
        userType = UserTypeForTransactionUpdates.AGENT_BALANCE;
        break;
      case 'member':
        userType = UserTypeForTransactionUpdates.MEMBER_BALANCE;
        break;
    }

    const transactionUpdate = {
      orderType,
      userType,
      rate,
      amount,
      before,
      after,
      payinOrder: orderDetails,
    };

    await this.transactionUpdateRepository.save(transactionUpdate);

    if (referral.children && referral.children.length > 0)
      for (const child of referral.children)
        await this.processReferral(child, orderType, payinAmount, orderDetails);
  }

  async create({ orderDetails, orderType }) {
    const { rate, amount, merchantId } = orderDetails;

    const referrals =
      await this.agentReferralService.getReferralTreeOfUser(merchantId);

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
