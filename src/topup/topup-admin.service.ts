import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topup } from './entities/topup.entity';
import { plainToInstance } from 'class-transformer';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { AdminAllTopupResponseDto } from './dto/paginate-response/admin-topup-response.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';

@Injectable()
export class TopupAdminService {
  constructor(
    @InjectRepository(Topup)
    private readonly topupRepository: Repository<Topup>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
  ) {}

  async paginate(paginateRequestDto: PaginateRequestDto, showPending = false) {
    const { search, pageSize, pageNumber, startDate, endDate, sortBy, status } =
      paginateRequestDto;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const queryBuilder = this.topupRepository
      .createQueryBuilder('topup')
      .leftJoinAndSelect('topup.merchant', 'merchant')
      .leftJoinAndSelect('merchant.identity', 'identity')
      .leftJoinAndSelect('topup.user', 'user')
      .leftJoinAndSelect('topup.member', 'member')
      .skip(skip)
      .take(take);

    if (search)
      queryBuilder.andWhere(
        `CONCAT(topup.id, ' ', topup.merchant) ILIKE :search`,
        {
          search: `%${search}%`,
        },
      );

    if (status) {
      queryBuilder.andWhere(`topup.status = :status`, {
        status: status.toUpperCase(),
      });
    }

    if (startDate && endDate) {
      const parsedStartDate = parseStartDate(startDate);
      const parsedEndDate = parseEndDate(endDate);

      queryBuilder.andWhere(
        'topup.created_at BETWEEN :startDate AND :endDate',
        {
          startDate: parsedStartDate,
          endDate: parsedEndDate,
        },
      );
    }

    const [rows, total] = await queryBuilder.getManyAndCount();

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    // fetch merchantCharge and systemProfit from transactionUpdate entity
    const dtos = await Promise.all(
      rows.map(async (row) => {
        const systemProfitRow = await this.transactionUpdateRepository.findOne({
          where: {
            systemOrderId: row.systemOrderId,
            userType: UserTypeForTransactionUpdates.SYSTEM_PROFIT,
          },
          relations: ['topupOrder'],
        });

        const response = {
          ...row,
          systemProfit: systemProfitRow?.after,
          callbackStatus: row?.notificationStatus,
        };

        return plainToInstance(AdminAllTopupResponseDto, response);
      }),
    );

    return {
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
      data: sortBy === 'latest' ? dtos.reverse() : dtos,
    };
  }

  async getTopupDetails(id: string) {
    const topup = await this.topupRepository.findOne({
      where: { systemOrderId: id },
      relations: ['member', 'member.identity'],
    });
    if (!topup) throw new NotFoundException('Order not found!');

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId: id,
        },
        relations: ['topupOrder', 'user'],
      });

    const response = {
      ...topup,
      transactionDetails: {
        transactionId: topup.transactionId,
        receipt: topup.transactionReceipt,
        member: topup.member ? JSON.parse(topup.transactionDetails) : null,
      },
      balancesAndProfit: transactionUpdateEntries,
    };

    return plainToInstance(AdminAllTopupResponseDto, response);
  }
}
