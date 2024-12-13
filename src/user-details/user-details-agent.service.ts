import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from 'src/agent/entities/agent.entity';
import { Withdrawal } from 'src/withdrawal/entities/withdrawal.entity';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import {
  OrderType,
  UserTypeForTransactionUpdates,
  WithdrawalOrderStatus,
} from 'src/utils/enum/enum';
import { roundOffAmount } from 'src/utils/utils';
import { plainToInstance } from 'class-transformer';
import { WithdrawalUserResponseDto } from 'src/withdrawal/dto/withdrawal-user-response.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { CommissionsAdminPaginateResponseDto } from 'src/transaction-updates/dto/commissions-paginate.dto';
import { Payin } from 'src/payin/entities/payin.entity';
import { Payout } from 'src/payout/entities/payout.entity';
import { Topup } from 'src/topup/entities/topup.entity';
import { FundRecordAdminResponseDto } from 'src/fund-record/dto/paginate-response.dto';
import { FundRecord } from 'src/fund-record/entities/fund-record.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';

@Injectable()
export class UserDetailsAgentService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(Payin)
    private readonly payinRepository: Repository<Payin>,
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(Topup)
    private readonly topupRepository: Repository<Topup>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    @InjectRepository(FundRecord)
    private readonly fundRecordRepository: Repository<FundRecord>,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async getAgentDetails(userId: number) {
    const agent = await this.agentRepository.findOne({
      where: { id: userId },
      relations: [
        'identity',
        'agentReferral',
        'referred',
        'identity.withdrawal',
        'agent',
        'organization',
      ],
    });
    if (!agent) throw new NotFoundException('Request agent not found!');

    const { frozenAmountThreshold } =
      await this.systemConfigService.findLatest();

    const transactionUpdatesAgent = await this.transactionUpdateRepository.find(
      {
        where: {
          user: { id: agent.identity.id },
        },
        relations: ['user', 'withdrawalOrder'],
      },
    );

    const transactionEntries = transactionUpdatesAgent.reduce(
      (prev, curr) => {
        if (curr.pending === false && curr.before !== curr.after) {
          if (curr.orderType === OrderType.WITHDRAWAL) {
            prev.withdrawalFee += curr?.amount;
            prev.withdrawanAmount += curr.withdrawalOrder?.amount;
          } else {
            prev.referralCommission += curr?.amount;
          }
        }

        return prev;
      },
      {
        withdrawanAmount: 0,
        withdrawalFee: 0,
        referralCommission: 0,
      },
    );

    return {
      name: agent.firstName + ' ' + agent.lastName,
      role: 'AGENT',
      email: agent.identity.email,
      phone: agent.phone,
      joinedOn: agent.createdAt,
      status: agent.enabled,
      referral: agent?.agent
        ? agent?.agent?.firstName + ' ' + agent?.agent?.lastName
        : 'None',
      referralsCount: agent?.referred?.filter(
        (code) => code.status === 'utilized',
      )?.length,
      organizationId: agent?.organization?.organizationId,
      balance: roundOffAmount(agent.balance),
      withdrawanAmount: roundOffAmount(transactionEntries.withdrawanAmount),
      withdrawalFee: roundOffAmount(transactionEntries.withdrawalFee),
      referralCommissions: roundOffAmount(
        transactionEntries.referralCommission,
      ),
      frozenAmount: agent.identity.withdrawal.reduce((prev, curr) => {
        if (curr.status === WithdrawalOrderStatus.PENDING) {
          const currentDate = new Date();
          const withdrawalDate = new Date(curr.createdAt);
          const diffInTime = currentDate.getTime() - withdrawalDate.getTime();
          const diffInDays = diffInTime / (1000 * 3600 * 24);

          if (diffInDays > frozenAmountThreshold) prev += curr.amount;
        }
        return prev;
      }, 0),
    };
  }

  async paginateAgentWithdrawals(paginateRequestDto: PaginateRequestDto) {
    const {
      search,
      pageSize,
      pageNumber,
      startDate,
      endDate,
      sortBy,
      forBulletin,
      userId,
    } = paginateRequestDto;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const queryBuilder = this.withdrawalRepository
      .createQueryBuilder('withdrawal')
      .leftJoinAndSelect('withdrawal.user', 'user')
      .leftJoinAndSelect('user.agent', 'agent')
      .skip(skip)
      .take(take);

    if (userId) queryBuilder.andWhere('agent.id = :userId', { userId });

    if (forBulletin)
      queryBuilder.andWhere('withdrawal.status = :status', {
        status: WithdrawalOrderStatus.PENDING,
      });

    if (search)
      queryBuilder.andWhere(`CONCAT(withdrawal.systemOrderId) ILIKE :search`, {
        search: `%${search}%`,
      });

    if (startDate && endDate) {
      const parsedStartDate = parseStartDate(startDate);
      const parsedEndDate = parseEndDate(endDate);

      queryBuilder.andWhere(
        'withdrawal.created_at BETWEEN :startDate AND :endDate',
        {
          startDate: parsedStartDate,
          endDate: parsedEndDate,
        },
      );
    }

    if (sortBy)
      sortBy === 'latest'
        ? queryBuilder.orderBy('withdrawal.createdAt', 'DESC')
        : queryBuilder.orderBy('withdrawal.createdAt', 'ASC');

    const [rows, total] = await queryBuilder.getManyAndCount();

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    const dtos = await Promise.all(
      rows.map(async (row) => {
        const transactionUpdate =
          await this.transactionUpdateRepository.findOne({
            where: {
              systemOrderId: row.systemOrderId,
              userType: UserTypeForTransactionUpdates.AGENT_BALANCE,
            },
          });

        const response = {
          ...row,
          serviceCharge: roundOffAmount(transactionUpdate?.amount) || 0,
          balanceAfter: roundOffAmount(transactionUpdate?.after) || 0,
          balanceBefore: roundOffAmount(transactionUpdate?.before) || 0,
          date: row.createdAt,
        };

        return plainToInstance(WithdrawalUserResponseDto, response);
      }),
    );

    return {
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
      data: dtos,
    };
  }

  async paginateAgentCommissions(paginateRequestDto: PaginateRequestDto) {
    const {
      startDate,
      endDate,
      search,
      pageNumber,
      pageSize,
      userEmail,
      sortBy,
    } = paginateRequestDto;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const queryBuilder = this.transactionUpdateRepository
      .createQueryBuilder('transactionUpdate')
      .leftJoinAndSelect('transactionUpdate.user', 'user')
      .skip(skip)
      .take(take);

    if (userEmail)
      queryBuilder.andWhere('user.email = :userEmail', { userEmail });

    if (search)
      queryBuilder.andWhere(
        `CONCAT(transactionUpdate.systemOrderId) ILIKE :search`,
        { search: `%${search}%` },
      );

    if (startDate && endDate) {
      const parsedStartDate = parseStartDate(startDate);
      const parsedEndDate = parseEndDate(endDate);

      queryBuilder.andWhere(
        'transactionUpdate.created_at BETWEEN :startDate AND :endDate',
        {
          startDate: parsedStartDate,
          endDate: parsedEndDate,
        },
      );
    }

    if (sortBy)
      sortBy === 'latest'
        ? queryBuilder.orderBy('transactionUpdate.createdAt', 'DESC')
        : queryBuilder.orderBy('transactionUpdate.createdAt', 'ASC');

    queryBuilder.andWhere(
      'transactionUpdate.userType IN (:agentCommission, :memberCommission)',
      {
        agentCommission: UserTypeForTransactionUpdates.AGENT_BALANCE,
        memberCommission: UserTypeForTransactionUpdates.MEMBER_BALANCE,
      },
    );
    queryBuilder.andWhere('transactionUpdate.pending = false');
    queryBuilder.andWhere(
      'NOT transactionUpdate.before = transactionUpdate.after',
    );
    queryBuilder.andWhere('transactionUpdate.orderType IN (:...orderType)', {
      orderType: [OrderType.PAYIN, OrderType.PAYOUT, OrderType.TOPUP],
    });

    const [rows, total] = await queryBuilder.getManyAndCount();

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    const dtos = await Promise.all(
      rows.map(async (row) => {
        const mapOrderType = {
          Payin: 'payinOrder',
          Payout: 'payoutOrder',
          Topup: 'topupOrder',
        };
        const orderType = mapOrderType[row.orderType];

        const merchantRow = await this.transactionUpdateRepository.findOne({
          where: {
            systemOrderId: row.systemOrderId,
            userType: UserTypeForTransactionUpdates.MERCHANT_BALANCE,
          },
          relations: ['payinOrder', 'payoutOrder', 'topupOrder'],
        });

        let orderRow;
        switch (orderType) {
          case 'payinOrder':
            orderRow = await this.payinRepository.findOneBy({
              systemOrderId: row.systemOrderId,
            });
            break;
          case 'payoutOrder':
            orderRow = await this.payoutRepository.findOneBy({
              systemOrderId: row.systemOrderId,
            });
            break;
          case 'topupOrder':
            orderRow = await this.topupRepository.findOneBy({
              systemOrderId: row.systemOrderId,
            });
            break;
        }

        const payload = {
          orderId: row.systemOrderId,
          orderType: row.orderType.toLowerCase(),
          agentMember: row?.name,
          merchant: orderType === 'topupOrder' ? 'None' : merchantRow?.name,
          merchantFees: orderType === 'topupOrder' ? 0 : merchantRow?.amount,
          orderAmount: roundOffAmount(orderRow?.amount) || 0,
          commission: row?.amount || 0,
          date: row.createdAt,
          referralUser: row?.isAgentOf,
        };

        return plainToInstance(CommissionsAdminPaginateResponseDto, payload);
      }),
    );

    return {
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
      data: dtos,
    };
  }

  async paginateAgentFundRecords(paginateRequestDto: PaginateRequestDto) {
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
}
