import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payout } from './entities/payout.entity';
import { plainToInstance } from 'class-transformer';
import { AdminPayoutDetailsResponseDto } from './dto/payout-details-response/admin-payout-details-response.dto';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { AdminAllPayoutResponseDto } from './dto/paginate-response/admin-payout-response.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';

@Injectable()
export class PayoutAdminService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
  ) {}

  async paginate(paginateRequestDto: PaginateRequestDto, showPending = false) {
    const { search, pageSize, pageNumber, startDate, endDate, sortBy } =
      paginateRequestDto;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const queryBuilder = this.payoutRepository
      .createQueryBuilder('payout')
      .leftJoinAndSelect('payout.merchant', 'merchant')
      .leftJoinAndSelect('merchant.identity', 'identity')
      .leftJoinAndSelect('payout.user', 'user')
      .leftJoinAndSelect('payout.member', 'member')
      .skip(skip)
      .take(take);

    if (search)
      queryBuilder.andWhere(
        `CONCAT(payout.id, ' ', payout.merchant) ILIKE :search`,
        {
          search: `%${search}%`,
        },
      );

    if (startDate && endDate) {
      const parsedStartDate = parseStartDate(startDate);
      const parsedEndDate = parseEndDate(endDate);

      queryBuilder.andWhere(
        'payout.created_at BETWEEN :startDate AND :endDate',
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
        const merchantRow = await this.transactionUpdateRepository.findOne({
          where: {
            systemOrderId: row.systemOrderId,
            user: { id: row.merchant?.identity?.id },
            userType: UserTypeForTransactionUpdates.MERCHANT_BALANCE,
          },
          relations: ['payoutOrder', 'user', 'user.merchant'],
        });

        const systemProfitRow = await this.transactionUpdateRepository.findOne({
          where: {
            systemOrderId: row.systemOrderId,
            userType: UserTypeForTransactionUpdates.SYSTEM_PROFIT,
          },
          relations: ['payoutOrder'],
        });

        const response = {
          ...row,
          merchantCharge: merchantRow?.amount,
          systemProfit: systemProfitRow?.after,
          callbackStatus: row?.notificationStatus,
        };

        return plainToInstance(AdminAllPayoutResponseDto, response);
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

  async getPayoutDetails(id: string) {
    const payout = await this.payoutRepository.findOne({
      where: { systemOrderId: id },
      relations: ['user', 'merchant', 'member'],
    });
    if (!payout) throw new NotFoundException('Order not found!');

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId: id,
        },
        relations: ['payoutOrder', 'user'],
      });

    const response = {
      ...payout,
      transactionDetails: {
        transactionId: payout.transactionId,
        receipt: payout.transactionReceipt,
        member: payout.member ? JSON.parse(payout.transactionDetails) : null,
        gateway: payout.gatewayName
          ? JSON.parse(payout.transactionDetails)
          : null,
      },
      balancesAndProfit: transactionUpdateEntries,
    };

    return plainToInstance(AdminPayoutDetailsResponseDto, response);
  }
}
