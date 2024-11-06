import { TransactionUpdate } from './../transaction-updates/entities/transaction-update.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { Repository } from 'typeorm';
import { Agent } from 'src/agent/entities/agent.entity';
import { plainToInstance } from 'class-transformer';
import {
  UserTypeForTransactionUpdates,
  WithdrawalOrderStatus,
} from 'src/utils/enum/enum';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import {
  WithdrawalDetailsUserResDto,
  WithdrawalUserResponseDto,
} from './dto/withdrawal-user-response.dto';

@Injectable()
export class WithdrawalAgentService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
  ) {}

  async getChannelProfileDetails(id: number) {
    const agent = await this.agentRepository.findOne({
      where: {
        id,
      },
      relations: [
        'identity',
        'identity.upi',
        'identity.netBanking',
        'identity.eWallet',
      ],
    });
    if (!agent) throw new NotFoundException('Agent not found!');

    const availableChannels: any = [];
    agent.identity?.upi?.length && availableChannels.push('upi');
    agent.identity?.netBanking?.length && availableChannels.push('netBanking');
    agent.identity?.eWallet?.length && availableChannels.push('eWallet');

    const channelProfiles = availableChannels.map((el) => {
      return {
        channelName: el,
        channelDetails: agent.identity[el],
      };
    });

    return {
      channelProfiles,
      minWithdrawal: agent.minWithdrawalAmount,
      maxWithdrawal: agent.maxWithdrawalAmount,
      currentBalance: agent.balance,
    };
  }

  async paginateWithdrawals(paginateRequestDto: PaginateRequestDto) {
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
          serviceCharge: transactionUpdate?.amount || 0,
          balanceAfter: transactionUpdate?.after || 0,
          balanceBefore: transactionUpdate?.before || 0,
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

  async getOrderDetails(id: string) {
    const orderDetails = await this.withdrawalRepository.findOne({
      where: { systemOrderId: id },
      relations: ['user', 'user.agent'],
    });
    if (!orderDetails) throw new NotFoundException('Order not found!');

    const transactionUpdate = await this.transactionUpdateRepository.findOne({
      where: {
        systemOrderId: id,
        userType: UserTypeForTransactionUpdates.AGENT_BALANCE,
      },
      relations: ['withdrawalOrder'],
    });

    const data = {
      ...orderDetails,
      serviceCharge: transactionUpdate?.amount || null,
      balanceDeducted:
        transactionUpdate?.before - transactionUpdate?.after || null,
      userChannel: JSON.parse(orderDetails.channelDetails),
      transactionDetails: JSON.parse(orderDetails.transactionDetails),
    };

    return plainToInstance(WithdrawalDetailsUserResDto, data);
  }
}
