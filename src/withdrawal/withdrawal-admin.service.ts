import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { Repository } from 'typeorm';
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

@Injectable()
export class WithdrawalAdminService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
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
      .skip(skip)
      .take(take);

    if (forBulletin)
      queryBuilder.andWhere('withdrawal.status = :status', {
        status: WithdrawalOrderStatus.PENDING,
      });

    if (search)
      queryBuilder.andWhere(
        `CONCAT(payin.id, ' ', payin.merchant) ILIKE :search`,
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
      data: sortBy === 'latest' ? dtos.reverse() : dtos,
    };
  }

  async getOrderDetails(id: string) {
    const orderDetails = await this.withdrawalRepository.findOne({
      where: { systemOrderId: id },
      relations: ['user', 'user.member', 'user.agent', 'user.merchant'],
    });
    if (!orderDetails) throw new NotFoundException('Order not found!');

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
      balancesAndProfit: null,
      userChannel: JSON.parse(orderDetails.channelDetails),
      transactionDetails: JSON.parse(orderDetails.transactionDetails),
    };

    return plainToInstance(WithdrawalDetailsAdminResDto, data);
  }
}
