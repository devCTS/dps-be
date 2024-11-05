import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { Between, Repository } from 'typeorm';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { plainToInstance } from 'class-transformer';
import {
  WithdrawalAdminResponseDto,
  WithdrawalDetailsAdminResDto,
} from './dto/withdrawal-admin-response.dto';
import { WithdrawalOrderStatus } from 'src/utils/enum/enum';
import { WithdrawalDefaultsDto } from 'src/system-config/dto/update-withdrawal-default.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';

@Injectable()
export class WithdrawalAdminService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
  ) {}

  async paginateWithdrawals(paginateRequestDto: PaginateRequestDto) {
    const {
      search,
      pageSize,
      pageNumber,
      startDate,
      endDate,
      sortBy,
      forBulletin,
    } = paginateRequestDto;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const queryBuilder = this.withdrawalRepository
      .createQueryBuilder('withdrawal')
      .leftJoinAndSelect('withdrawal.user', 'user')
      .leftJoinAndSelect('user.member', 'member')
      .leftJoinAndSelect('user.agent', 'agent')
      .leftJoinAndSelect('user.merchant', 'merchant')
      .skip(skip)
      .take(take);

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
        const response = {
          ...row,
          userRole: row.user?.userType,
          user: row.user[row.user?.userType.toLowerCase()],
          systemProfit: null,
          merchantFee: null,
          merchantCharge: null,
          date: row.createdAt,
        };

        return plainToInstance(WithdrawalAdminResponseDto, response);
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
      relations: ['user', 'user.member', 'user.agent', 'user.merchant'],
    });
    if (!orderDetails) throw new NotFoundException('Order not found!');

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId: id,
          pending: false,
        },
        relations: ['withdrawalOrder'],
      });

    const userRole = orderDetails.user.userType.toLowerCase();

    const data = {
      ...orderDetails,
      user: {
        role: userRole,
        name:
          orderDetails.user[userRole]?.firstName +
          ' ' +
          orderDetails.user[userRole]?.lastName,
        id: orderDetails.user[userRole]?.id,
      },
      userChannel: JSON.parse(orderDetails.channelDetails),
      transactionDetails: JSON.parse(orderDetails.transactionDetails),
      balancesAndProfit: transactionUpdateEntries || null,
    };

    return plainToInstance(WithdrawalDetailsAdminResDto, data);
  }

  async exportRecords(startDate: string, endDate: string) {
    startDate = parseStartDate(startDate);
    endDate = parseEndDate(endDate);

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    const [rows, total] = await this.withdrawalRepository.findAndCount({
      relations: ['user'],
      where: {
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    const dtos = await Promise.all(
      rows.map(async (row) => {
        const response = {
          ...row,
          userRole: row.user?.userType,
          user: row.user[row.user?.userType.toLowerCase()],
          systemProfit: null,
          merchantFee: null,
          merchantCharge: null,
          date: row.createdAt,
        };

        return plainToInstance(WithdrawalAdminResponseDto, response);
      }),
    );

    return {
      total,
      data: dtos,
    };
  }
}
