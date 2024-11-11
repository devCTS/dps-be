import { roundOffAmount } from './../utils/utils';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { Payin } from './entities/payin.entity';
import { Between, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import {
  PayinAdminResponseDto,
  PayinDetailsAdminResDto,
} from './dto/payin-admin-response.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';

@Injectable()
export class PayinAdminService {
  constructor(
    @InjectRepository(Payin)
    private payinRepository: Repository<Payin>,
    @InjectRepository(TransactionUpdate)
    private transactionUpdateRepository: Repository<TransactionUpdate>,
  ) {}

  async paginatePayins(paginateRequestDto: PaginateRequestDto) {
    const {
      search,
      pageSize,
      pageNumber,
      startDate,
      endDate,
      sortBy,
      filterStatusArray,
      filterChannelArray,
      filterMadeVia,
      filterAmountLower,
      filterAmountUpper,
    } = paginateRequestDto;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const queryBuilder = this.payinRepository
      .createQueryBuilder('payin')
      .leftJoinAndSelect('payin.merchant', 'merchant')
      .leftJoinAndSelect('merchant.identity', 'identity')
      .leftJoinAndSelect('payin.user', 'user')
      .leftJoinAndSelect('payin.member', 'member')
      .skip(skip)
      .take(take);

    if (search)
      queryBuilder.andWhere(
        `CONCAT(payin.systemOrderId, ' ', payin.merchantOrderId) ILIKE :search`,
        {
          search: `%${search}%`,
        },
      );

    if (startDate && endDate) {
      const parsedStartDate = parseStartDate(startDate);
      const parsedEndDate = parseEndDate(endDate);

      queryBuilder.andWhere(
        'payin.created_at BETWEEN :startDate AND :endDate',
        {
          startDate: parsedStartDate,
          endDate: parsedEndDate,
        },
      );
    }

    if (sortBy)
      sortBy === 'latest'
        ? queryBuilder.orderBy('payin.createdAt', 'DESC')
        : queryBuilder.orderBy('payin.createdAt', 'ASC');

    // Apply filterStatusArray filter
    if (filterStatusArray && filterStatusArray.length > 0) {
      queryBuilder.andWhere('payin.status IN (:...filterStatusArray)', {
        filterStatusArray,
      });
    }

    // Apply filterChannelArray filter
    if (filterChannelArray && filterChannelArray.length > 0) {
      queryBuilder.andWhere('payin.channel IN (:...filterChannelArray)', {
        filterChannelArray,
      });
    }

    // Apply filterMadeVia filter
    if (filterMadeVia && filterMadeVia !== 'BOTH') {
      queryBuilder.andWhere('payin.payinMadeOn = :filterMadeVia', {
        filterMadeVia: filterMadeVia,
      });
    }

    // Apply filterAmountLower and filterAmountUpper filters
    if (filterAmountLower !== undefined && filterAmountLower !== null) {
      queryBuilder.andWhere('payin.amount >= :filterAmountLower', {
        filterAmountLower,
      });
    }
    if (filterAmountUpper !== undefined && filterAmountUpper !== null) {
      queryBuilder.andWhere('payin.amount <= :filterAmountUpper', {
        filterAmountUpper,
      });
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
          relations: ['payinOrder', 'user', 'user.merchant'],
        });

        const systemProfitRow = await this.transactionUpdateRepository.findOne({
          where: {
            systemOrderId: row.systemOrderId,
            userType: UserTypeForTransactionUpdates.SYSTEM_PROFIT,
          },
          relations: ['payinOrder'],
        });

        const response = {
          ...row,
          merchantCharge: roundOffAmount(merchantRow?.amount),
          systemProfit: roundOffAmount(systemProfitRow?.amount),
        };

        return plainToInstance(PayinAdminResponseDto, response);
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

  async getPayinDetails(id: string) {
    const payin = await this.payinRepository.findOne({
      where: { systemOrderId: id },
      relations: ['user', 'merchant', 'member'],
    });
    if (!payin) throw new NotFoundException('Order not found!');

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId: id,
        },
        relations: ['payinOrder', 'user'],
      });

    const response = {
      ...payin,
      transactionDetails: {
        transactionId: payin.transactionId,
        receipt: payin.transactionReceipt,
        member: payin.member ? JSON.parse(payin.transactionDetails) : null,
        gateway: payin.gatewayName
          ? JSON.parse(payin.transactionDetails)
          : null,
      },
      balancesAndProfit: transactionUpdateEntries,
    };

    return plainToInstance(PayinDetailsAdminResDto, response);
  }

  async exportRecords(startDate: string, endDate: string) {
    startDate = parseStartDate(startDate);
    endDate = parseEndDate(endDate);

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    const [rows, total] = await this.payinRepository.findAndCount({
      relations: ['user'],
      where: {
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    const dtos = await Promise.all(
      rows.map(async (row) => {
        const merchantRow = await this.transactionUpdateRepository.findOne({
          where: {
            systemOrderId: row.systemOrderId,
            user: { id: row.merchant?.identity?.id },
            userType: UserTypeForTransactionUpdates.MERCHANT_BALANCE,
          },
          relations: ['payinOrder', 'user', 'user.merchant'],
        });

        const systemProfitRow = await this.transactionUpdateRepository.findOne({
          where: {
            systemOrderId: row.systemOrderId,
            userType: UserTypeForTransactionUpdates.SYSTEM_PROFIT,
          },
          relations: ['payinOrder'],
        });

        const response = {
          ...row,
          merchantCharge: merchantRow?.amount,
          systemProfit: systemProfitRow?.after,
        };

        return plainToInstance(PayinAdminResponseDto, response);
      }),
    );

    return {
      total,
      data: dtos,
    };
  }
}
