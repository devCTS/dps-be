import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { plainToInstance } from 'class-transformer';
import { CommissionsAdminPaginateResponseDto } from './dto/commissions-paginate.dto';
import { OrderType, UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { roundOffAmount } from 'src/utils/utils';
import { Payin } from 'src/payin/entities/payin.entity';
import { Payout } from 'src/payout/entities/payout.entity';
import { Topup } from 'src/topup/entities/topup.entity';

@Injectable()
export class TransactionUpdatesService {
  constructor(
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    @InjectRepository(Payin)
    private readonly payinRepository: Repository<Payin>,
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(Topup)
    private readonly topupRepository: Repository<Topup>,
  ) {}

  async paginateCommissionsAndProfits(
    paginateRequestDto: PaginateRequestDto,
    userEmail,
  ) {
    const {
      startDate,
      endDate,
      search,
      pageNumber,
      pageSize,
      // userEmail,
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

  async exportRecords(startDate: string, endDate: string) {
    startDate = parseStartDate(startDate);
    endDate = parseEndDate(endDate);

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    const queryBuilder = this.transactionUpdateRepository
      .createQueryBuilder('transactionUpdate')
      .leftJoinAndSelect('transactionUpdate.user', 'user');

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
    queryBuilder.andWhere(
      'transactionUpdate.createdAt BETWEEN :startDate AND :endDate',
      {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
    );

    const [rows, total] = await queryBuilder.getManyAndCount();

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
            userType: UserTypeForTransactionUpdates.MEMBER_BALANCE,
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
        };

        return plainToInstance(CommissionsAdminPaginateResponseDto, payload);
      }),
    );

    return {
      total,
      data: dtos,
    };
  }
}
