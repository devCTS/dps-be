import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Topup } from './entities/topup.entity';
import { In, Repository } from 'typeorm';

import {
  ChannelName,
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
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { Agent } from 'src/agent/entities/agent.entity';

@Injectable()
export class TopupService {
  constructor(
    @InjectRepository(Topup)
    private readonly topupRepository: Repository<Topup>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,

    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    private readonly transactionUpdateTopupService: TransactionUpdatesTopupService,
    private readonly memberService: MemberService,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async getCurrentToupHoldings() {
    // return 2000;

    const merchants = await this.merchantRepository.find();
    const totalMerchantBalance = merchants.reduce((prev, curr) => {
      return prev + curr?.balance;
    }, 0);

    const members = await this.memberRepository.find();
    const totalMemberBalance = members.reduce((prev, curr) => {
      return prev + curr?.balance;
    }, 0);

    const agents = await this.agentRepository.find();
    const totalAgentBalance = agents.reduce((prev, curr) => {
      return prev + curr?.balance;
    }, 0);

    const currentSystemProfit = (await this.systemConfigService.findLatest())
      .systemProfit;

    const setelledTopupOrders = await this.topupRepository.find({
      where: {
        status: OrderStatus.COMPLETE,
      },
    });
    const totalSetteledAmount = setelledTopupOrders.reduce((prev, curr) => {
      return prev + curr?.amount;
    }, 0);

    const topupHoldings =
      totalMerchantBalance +
      totalAgentBalance +
      totalMemberBalance +
      currentSystemProfit -
      totalSetteledAmount;

    return topupHoldings;
  }

  async getNextTopupChannel() {
    return {
      channel: ChannelName.UPI,
      channelDetails: {
        'UPI ID': '123123123@ybs',
        Mobile: '1231231230',
      },
    };
  }

  async checkAndCreate() {
    const pendingTopupOrderExists = await this.topupRepository.findOne({
      where: {
        status: In([
          OrderStatus.ASSIGNED,
          OrderStatus.INITIATED,
          OrderStatus.SUBMITTED,
        ]),
      },
    });
    if (pendingTopupOrderExists) return;

    const currentTopupHoldings = await this.getCurrentToupHoldings();
    const nextTopupChannel = await this.getNextTopupChannel();

    const { topupThreshold, topupAmount } =
      await this.systemConfigService.findLatest();

    if (currentTopupHoldings >= topupThreshold) {
      this.create({
        amount: topupAmount,
        channel: nextTopupChannel.channel,
        channelDetails: JSON.stringify(nextTopupChannel.channelDetails),
      });
    }
  }

  async getCurrentTopupDetails() {
    const { systemProfit, topupAmount, topupThreshold } =
      await this.systemConfigService.findLatest();
    const currentSystemHoldings = await this.getCurrentToupHoldings();
    const amountPending = topupThreshold - currentSystemHoldings;
    const nextTopupChannel = await this.getNextTopupChannel();

    const currentTopup = await this.topupRepository.findOne({
      where: {
        status: In([
          OrderStatus.INITIATED,
          OrderStatus.ASSIGNED,
          OrderStatus.SUBMITTED,
        ]),
      },
      relations: ['member'],
    });

    return {
      upperCard: {
        currentSystemProfit: systemProfit,
        currentSystemHoldings,
        amountPending: amountPending < 0 ? 0 : amountPending,
        nextTopupAmount: topupAmount,
        nextTopupChannel,
      },
      lowerCard: currentTopup
        ? {
            amount: currentTopup.amount,
            channel: currentTopup.channel,
            channelDetails: JSON.parse(currentTopup.transactionDetails),
            status: currentTopup.status,
            member: currentTopup.member
              ? {
                  name:
                    currentTopup.member.firstName +
                    ' ' +
                    currentTopup.member.lastName,
                  id: currentTopup.member.id,
                }
              : null,
          }
        : null,
    };
  }

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
