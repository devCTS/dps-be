import { identity } from 'rxjs';
import { Topup } from 'src/topup/entities/topup.entity';
import {
  HttpStatus,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateSettlementDto,
  MemberSettlementDto,
} from './dto/create-fund-record.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Identity } from 'src/identity/entities/identity.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Member } from 'src/member/entities/member.entity';
import { Agent } from 'src/agent/entities/agent.entity';
import { MemberService } from 'src/member/member.service';
import { MerchantService } from 'src/merchant/merchant.service';
import { AgentService } from 'src/agent/agent.service';
import { FundRecord } from './entities/fund-record.entity';
import { OrderType, UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { getDescription } from './find-record.utils';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { plainToInstance } from 'class-transformer';
import { FundRecordAdminResponseDto } from './dto/paginate-response.dto';
import * as uniqid from 'uniqid';
import { roundOffAmount } from 'src/utils/utils';

@Injectable()
export class FundRecordService {
  constructor(
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    @InjectRepository(FundRecord)
    private readonly fundRecordRepository: Repository<FundRecord>,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,

    private readonly memberService: MemberService,
    private readonly merchantService: MerchantService,
    private readonly agentService: AgentService,
  ) {}

  async paginateFundRecords(paginateRequestDto: PaginateRequestDto) {
    const {
      search,
      pageSize,
      pageNumber,
      startDate,
      endDate,
      sortBy,
      balanceType,
      userEmail,
    } = paginateRequestDto;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const queryBuilder = this.fundRecordRepository
      .createQueryBuilder('fundRecord')
      .leftJoinAndSelect('fundRecord.user', 'user')
      .skip(skip)
      .take(take);

    if (userEmail)
      queryBuilder.andWhere('user.email = :userEmail', { userEmail });

    if (search)
      queryBuilder.andWhere(
        `CONCAT(fundRecord.systemOrderId, ' ', fundRecord.name) ILIKE :search`,
        {
          search: `%${search}%`,
        },
      );

    if (startDate && endDate) {
      const parsedStartDate = parseStartDate(startDate);
      const parsedEndDate = parseEndDate(endDate);

      queryBuilder.andWhere(
        'fundRecord.created_at BETWEEN :startDate AND :endDate',
        {
          startDate: parsedStartDate,
          endDate: parsedEndDate,
        },
      );
    }

    if (sortBy)
      sortBy === 'latest'
        ? queryBuilder.orderBy('fundRecord.createdAt', 'DESC')
        : queryBuilder.orderBy('fundRecord.createdAt', 'ASC');

    if (balanceType)
      queryBuilder.andWhere('fundRecord.balanceType = :balanceType', {
        balanceType: balanceType,
      });

    const [rows, total] = await queryBuilder.getManyAndCount();

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    return {
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
      data: plainToInstance(FundRecordAdminResponseDto, rows),
    };
  }

  async addFundRecordForSuccessOrder({
    orderType,
    orderAmount,
    systemOrderId,
  }) {
    switch (orderType) {
      case OrderType.PAYIN:
        await this.createFundRecordForPayin({ orderAmount, systemOrderId });
        break;

      case OrderType.PAYOUT:
        await this.createFundRecordForPayout({ orderAmount, systemOrderId });
        break;

      case OrderType.WITHDRAWAL:
        await this.createFundRecordForWithdrawal({
          orderAmount,
          systemOrderId,
        });
        break;

      case OrderType.TOPUP:
        await this.createFundRecordForTopup({ orderAmount, systemOrderId });
        break;
    }
  }

  private async createFundRecordForPayin({ orderAmount, systemOrderId }) {
    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId: systemOrderId,
          orderType: OrderType.PAYIN,
          pending: false,
        },
        relations: ['user'],
      });

    for (const row of transactionUpdateEntries) {
      const fundRecordEntry = {
        orderType: OrderType.PAYIN,
        name: row.name,
        balanceType: row.userType,
        systemOrderId: row.systemOrderId,
        before: row.before,
        after: row.after,
        amount: row.amount || 0,
        serviceFee: row.amount || 0,
        orderAmount,
        user: row.user,
        description: getDescription(),
      };

      await this.fundRecordRepository.save(fundRecordEntry);
    }
  }

  private async createFundRecordForPayout({ orderAmount, systemOrderId }) {
    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId: systemOrderId,
          orderType: OrderType.PAYOUT,
          pending: false,
        },
        relations: ['user'],
      });

    for (const row of transactionUpdateEntries) {
      const fundRecordEntry = {
        orderType: OrderType.PAYOUT,
        name: row.name,
        balanceType: row.userType,
        systemOrderId: row.systemOrderId,
        before: row.before,
        after: row.after,
        amount: row.amount || 0,
        serviceFee: row.amount || 0,
        orderAmount,
        user: row.user,
        description: getDescription(),
      };

      await this.fundRecordRepository.save(fundRecordEntry);
    }
  }

  private async createFundRecordForWithdrawal({ orderAmount, systemOrderId }) {
    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId: systemOrderId,
          orderType: OrderType.WITHDRAWAL,
          pending: false,
        },
        relations: ['user'],
      });

    for (const row of transactionUpdateEntries) {
      const fundRecordEntry = {
        orderType: OrderType.WITHDRAWAL,
        name: row.name,
        balanceType: row.userType,
        systemOrderId: row.systemOrderId,
        before: row.before,
        after: row.after,
        amount: row.amount || 0,
        serviceFee: row.amount || 0,
        orderAmount,
        user: row.user,
        description: getDescription(),
      };

      await this.fundRecordRepository.save(fundRecordEntry);
    }
  }

  private async createFundRecordForTopup({ orderAmount, systemOrderId }) {
    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId: systemOrderId,
          orderType: OrderType.TOPUP,
          pending: false,
        },
        relations: ['user'],
      });

    for (const row of transactionUpdateEntries) {
      const fundRecordEntry = {
        orderType: OrderType.TOPUP,
        name: row.name,
        balanceType: row.userType,
        systemOrderId: row.systemOrderId,
        before: row.before,
        after: row.after,
        amount: row.amount || 0,
        serviceFee: row.amount || 0,
        orderAmount,
        user: row.user,
        description: getDescription(),
      };

      await this.fundRecordRepository.save(fundRecordEntry);
    }
  }

  async adminAdjustment(createSettlementDto: CreateSettlementDto) {
    const { amount, userId, operation, balanceType } = createSettlementDto;

    let amountAfterOperation = 0;
    if (operation === 'INCREMENT') amountAfterOperation = amount;
    if (operation === 'DECREMENT') amountAfterOperation = -amount;

    let before, after;
    let user;

    switch (balanceType) {
      case UserTypeForTransactionUpdates.MERCHANT_BALANCE:
        const merchant = await this.merchantRepository.findOne({
          where: { id: userId },
          relations: ['identity'],
        });
        if (!merchant) throw new NotFoundException('User not found!');

        await this.merchantService.updateBalance(
          merchant.identity.id,
          '0',
          amountAfterOperation,
          false,
        );

        user = await this.merchantRepository.findOneBy({
          id: merchant.id,
        });

        before = user.balance;
        after = before + amount;

        break;

      case UserTypeForTransactionUpdates.MEMBER_BALANCE:
        const memberBal = await this.memberRepository.findOne({
          where: { id: userId },
          relations: ['identity'],
        });
        if (!memberBal) throw new NotFoundException('User not found!');

        await this.memberService.updateBalance(
          memberBal.identity.id,
          '0',
          amountAfterOperation,
          false,
        );

        user = await this.memberRepository.findOneBy({
          id: memberBal.id,
        });

        before = user.balance;
        after = before + amount;

        break;

      case UserTypeForTransactionUpdates.MEMBER_QUOTA:
        const memberQuota = await this.memberRepository.findOne({
          where: { id: userId },
          relations: ['identity'],
        });
        if (!memberQuota) throw new NotFoundException('User not found!');

        await this.memberService.updateQuota(
          memberQuota.identity.id,
          '0',
          amountAfterOperation,
          false,
        );

        user = await this.memberRepository.findOneBy({
          id: memberQuota.id,
        });

        before = user.quota;
        after = before + amount;

        break;

      case UserTypeForTransactionUpdates.AGENT_BALANCE:
        const agent = await this.agentRepository.findOne({
          where: { id: userId },
          relations: ['identity'],
        });
        if (!agent) throw new NotFoundException('User not found!');

        await this.agentService.updateBalance(
          agent.identity.id,
          '0',
          amountAfterOperation,
          false,
        );

        user = await this.agentRepository.findOneBy({
          id: agent.id,
        });

        before = user.balance;
        after = before + amount;

        break;

      default:
        throw new NotAcceptableException('Invalid user type!');
    }

    const fundRecordEntry = {
      orderType: OrderType.ADMIN_ADJUSTMENT,
      name: user?.firstName + ' ' + user?.lastName,
      balanceType: balanceType,
      systemOrderId: uniqid(),
      before,
      after,
      amount: 0,
      serviceFee: 0,
      orderAmount: amount,
      user,
      description: getDescription(),
    };

    await this.fundRecordRepository.save(fundRecordEntry);
  }

  async memberAdjustment(createSettlementDto: MemberSettlementDto) {
    const { amount, sendingMemberId, receivingMemberEmail } =
      createSettlementDto;

    const sendingMember = await this.memberRepository.findOne({
      where: {
        id: sendingMemberId,
      },
      relations: ['identity'],
    });
    if (!sendingMember)
      throw new NotFoundException('Sending member not found!');

    const receivingMember = await this.memberRepository.findOne({
      where: {
        identity: { email: receivingMemberEmail },
      },
      relations: ['identity'],
    });
    if (!receivingMember)
      throw new NotFoundException('Receiving member not found!');

    // Deduct from sending member
    await this.memberService.updateQuota(
      sendingMember.identity.id,
      '0',
      -amount,
      false,
    );
    await this.fundRecordRepository.save({
      orderType: OrderType.ADMIN_ADJUSTMENT,
      name: sendingMember?.firstName + ' ' + sendingMember?.lastName,
      balanceType: UserTypeForTransactionUpdates.MEMBER_QUOTA,
      systemOrderId: uniqid(),
      before: sendingMember.quota,
      after: sendingMember.quota + amount,
      amount: 0,
      serviceFee: 0,
      orderAmount: amount,
      user: sendingMember.identity,
      description: getDescription(),
    });

    // Add in receiving member
    await this.memberService.updateQuota(
      receivingMember.identity.id,
      '0',
      amount,
      false,
    );
    await this.fundRecordRepository.save({
      orderType: OrderType.ADMIN_ADJUSTMENT,
      name: receivingMember?.firstName + ' ' + receivingMember?.lastName,
      balanceType: UserTypeForTransactionUpdates.MEMBER_QUOTA,
      systemOrderId: uniqid(),
      before: receivingMember.quota,
      after: receivingMember.quota + amount,
      amount: 0,
      serviceFee: 0,
      orderAmount: amount,
      user: receivingMember.identity,
      description: getDescription(),
    });

    return HttpStatus.OK;
  }

  async exportRecords(startDate: string, endDate: string) {
    startDate = parseStartDate(startDate);
    endDate = parseEndDate(endDate);

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    const [rows, total] = await this.fundRecordRepository.findAndCount({
      relations: ['user'],
      where: {
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    return {
      total,
      data: plainToInstance(FundRecordAdminResponseDto, rows),
    };
  }
}
