import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { plainToInstance } from 'class-transformer';
import { CommissionsAdminPaginateResponseDto } from './dto/commissions-paginate.dto';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';

@Injectable()
export class TransactionUpdatesService {
  constructor(
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
  ) {}

  async paginateCommissionsAndProfits(paginateRequestDto: PaginateRequestDto) {
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

    if (search) {
      queryBuilder.andWhere(
        `CONCAT(transactionUpdate.systemOrderId) ILIKE :search`,
        { search: `%${search}%` },
      );
    }

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

    const [rows, total] = await queryBuilder.getManyAndCount();

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    const dtos = await Promise.all(
      rows.map(async (row) => {
        const orderType =
          row.orderType === 'Payin' ? 'payinOrder' : 'payoutOrder';

        const merchantRow = await this.transactionUpdateRepository.findOne({
          where: {
            systemOrderId: row.systemOrderId,
            userType: UserTypeForTransactionUpdates.MERCHANT_BALANCE,
          },
          relations: ['payinOrder', 'payoutOrder'],
        });

        const payload = {
          orderId: row.systemOrderId,
          orderType: orderType === 'payinOrder' ? 'payin' : 'payout',
          agentMember: row.name,
          merchant: merchantRow.name,
          merchantFees: merchantRow.amount,
          orderAmount: merchantRow[orderType].amount,
          commission: row.amount,
          date: row.createdAt,
          referralUser: merchantRow.name,
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
}
