import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Topup } from './entities/topup.entity';
import { Repository } from 'typeorm';

import {
  OrderStatus,
  OrderType,
  UserTypeForTransactionUpdates,
} from 'src/utils/enum/enum';

import * as uniqid from 'uniqid';
import { Member } from 'src/member/entities/member.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { MemberService } from 'src/member/member.service';

import { CreateTopupDto } from './dto/create-topup.dto';
import { UpdateTopupDto } from './dto/update-topup.dto';
import { TransactionUpdatesTopupService } from 'src/transaction-updates/transaction-updates-topup.service';

@Injectable()
export class TopupService {
  constructor(
    @InjectRepository(Topup)
    private readonly topupRepository: Repository<Topup>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    private readonly transactionUpdateTopupService: TransactionUpdatesTopupService,
    private readonly memberService: MemberService,
  ) {}

  async create(topupDetails: CreateTopupDto) {
    const topup = await this.topupRepository.save({
      ...topupDetails,
      systemOrderId: uniqid(),
    });

    if (!topup) throw new InternalServerErrorException('Topup error');

    return HttpStatus.CREATED;
  }

  async updateTopupStatusToAssigned(body) {
    const { id, memberId, memberPaymentDetails } = body;

    if (!memberId || !memberPaymentDetails)
      throw new NotAcceptableException('memberId or payment details missing!');

    const topupOrderDetails = await this.topupRepository.findOne({
      where: { systemOrderId: id },
    });

    if (!topupOrderDetails) throw new NotFoundException('Order not found');

    if (topupOrderDetails.status !== OrderStatus.INITIATED)
      throw new NotAcceptableException('order status is not initiated!');

    const member = await this.memberRepository.findOneBy({ id: memberId });

    if (!member) throw new NotFoundException('Member not found');

    await this.transactionUpdateTopupService.create({
      orderDetails: topupOrderDetails,
      userId: memberId,
      orderType: OrderType.PAYOUT,
      systemOrderId: topupOrderDetails.systemOrderId,
    });

    await this.topupRepository.update(
      { systemOrderId: id },
      {
        status: OrderStatus.ASSIGNED,
        transactionDetails: JSON.stringify(memberPaymentDetails),
        member,
      },
    );

    return HttpStatus.OK;
  }

  async updateTopupStatusToComplete(body) {
    const { id } = body;
    const topupOrderDetails = await this.topupRepository.findOneBy({
      systemOrderId: id,
    });
    if (!topupOrderDetails) throw new NotFoundException('Order not found');

    if (topupOrderDetails.status !== OrderStatus.SUBMITTED)
      throw new NotAcceptableException(
        'order status is not submitted or already failed or completed!',
      );

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId: id,
          pending: true,
        },
        relations: ['user'],
      });

    transactionUpdateEntries.forEach(async (entry) => {
      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_BALANCE)
        await this.memberService.updateBalance(
          entry.user.id,
          entry.after,
          false,
        );

      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_QUOTA)
        await this.memberService.updateQuota(entry.user.id, entry.after, false);

      await this.transactionUpdateRepository.update(entry.id, {
        pending: false,
      });
    });

    await this.topupRepository.update(
      { systemOrderId: id },
      {
        status: OrderStatus.COMPLETE,
      },
    );

    return HttpStatus.OK;
  }

  async updateTopupStatusToFailed(body) {
    const { id } = body;

    const topupOrderDetails = await this.topupRepository.findOneBy({
      systemOrderId: id,
    });
    if (!topupOrderDetails) throw new NotFoundException('Order not found');

    if (topupOrderDetails.status !== OrderStatus.SUBMITTED)
      throw new NotAcceptableException(
        'order status is not submitted or already failed or completed!',
      );

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId: id,
          pending: true,
        },
        relations: ['user'],
      });

    transactionUpdateEntries.forEach(async (entry) => {
      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_BALANCE)
        await this.memberService.updateBalance(entry.user.id, 0, true);

      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_QUOTA)
        await this.memberService.updateQuota(entry.user.id, 0, true);

      await this.transactionUpdateRepository.update(entry.id, {
        pending: false,
      });
    });

    await this.topupRepository.update(
      { systemOrderId: id },
      { status: OrderStatus.FAILED },
    );

    return HttpStatus.OK;
  }

  async updateTopupStatusToSubmitted(body) {
    const { id, transactionId, transactionReceipt } = body;

    if (!transactionId && !transactionReceipt)
      throw new NotAcceptableException('Transaction ID or receipt missing!');

    const topupOrderDetails = await this.topupRepository.findOneBy({
      systemOrderId: id,
    });

    if (!topupOrderDetails) throw new NotFoundException('Order not found');

    if (topupOrderDetails.status !== OrderStatus.ASSIGNED)
      throw new NotAcceptableException('order status is not assigned!');

    await this.topupRepository.update(
      { systemOrderId: id },
      {
        status: OrderStatus.SUBMITTED,
        transactionId,
        transactionReceipt,
      },
    );

    return HttpStatus.OK;
  }

  findAll() {
    return `This action returns all topup`;
  }

  async findOne(id: string) {
    return await this.topupRepository.findOneBy({ systemOrderId: id });
  }

  update(id: number, updateTopupDto: UpdateTopupDto) {
    return `This action updates a #${id} topup`;
  }

  remove(id: number) {
    return `This action removes a #${id} topup`;
  }
}
