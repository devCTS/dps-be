import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { Repository } from 'typeorm';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { plainToInstance } from 'class-transformer';
import { WithdrawalAdminResponseDto } from './dto/withdrawal-admin-response.dto';

@Injectable()
export class WithdrawalAdminService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
  ) {}

  async paginateWithdrawals(paginateRequestDto: PaginateRequestDto) {
    const { search, pageSize, pageNumber, startDate, endDate, sortBy } =
      paginateRequestDto;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const queryBuilder = this.withdrawalRepository
      .createQueryBuilder('withdrawal')
      .leftJoinAndSelect('withdrawal.user', 'user')
      .leftJoinAndSelect('user.member', 'member')
      .skip(skip)
      .take(take);

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
}
