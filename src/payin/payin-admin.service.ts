import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { Payin } from './entities/payin.entity';
import { Repository } from 'typeorm';
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
    const { search, pageSize, pageNumber, startDate, endDate, sortedBy } =
      paginateRequestDto;

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
      queryBuilder.andWhere(`CONCAT(payin.merchant) ILIKE :search`, {
        search: `%${search}%`,
      });

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

    if (sortedBy)
      if (sortedBy === 'latest')
        queryBuilder.orderBy('payin.created_at', 'DESC');
      else if (sortedBy === 'oldest')
        queryBuilder.orderBy('payin.created_at', 'ASC');

    const [rows, total] = await queryBuilder.getManyAndCount();

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    // fetch merchantCharge and systemProfit from transactionUpdate entity
    const dtos = await Promise.all(
      rows.map(async (row) => {
        const merchantRow = await this.transactionUpdateRepository.findOne({
          where: {
            payinOrder: { id: row.id },
            user: { id: row.merchant?.identity?.id },
            userType: UserTypeForTransactionUpdates.MERCHANT_BALANCE,
          },
          relations: ['payinOrder', 'user', 'user.merchant'],
        });

        const systemProfitRow = await this.transactionUpdateRepository.findOne({
          where: {
            payinOrder: { id: row.id },
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
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
      data: dtos,
    };
  }

  async getPayinDetails(id: number) {
    const payin = await this.payinRepository.findOne({
      where: { id },
      relations: ['user', 'merchant', 'member'],
    });
    if (!payin) throw new NotFoundException('Order not found!');

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          payinOrder: { id },
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
}
