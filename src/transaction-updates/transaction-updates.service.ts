import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateTransactionUpdateDto } from './dto/create-transaction-update.dto';
import { UpdateTransactionUpdateDto } from './dto/update-transaction-update.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderType } from 'src/utils/enum/enum';
import { AgentReferralService } from 'src/agent-referral/agent-referral.service';

@Injectable()
export class TransactionUpdatesService {
  constructor(
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    private readonly agentReferralService: AgentReferralService,
  ) {}

  async create(orderDetails) {
    const {
      orderType,
      userType,
      rate,
      amount,
      before,
      after,
      pending,
      userId,
    } = orderDetails;

    const referrals =
      await this.agentReferralService.getReferralTreeOfUser(userId);

    for (const referral in referrals) {
      if (referral) {
      }
    }

    const transactionUpdate = await this.transactionUpdateRepository.save({
      orderType,
      userType,
      rate,
      amount,
      before,
      after,
      pending,
    });

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
