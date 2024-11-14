import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Topup } from './entities/topup.entity';
import { plainToInstance } from 'class-transformer';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { AdminAllTopupResponseDto } from './dto/paginate-response/admin-topup-response.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import {
  OrderStatus,
  UserTypeForTransactionUpdates,
} from 'src/utils/enum/enum';
import { AdminTopupDetailsResponseDto } from './dto/topup-details-response/admin-topup-details-response.dto';
import { roundOffAmount } from 'src/utils/utils';

@Injectable()
export class TopupAdminService {
  constructor(
    @InjectRepository(Topup)
    private readonly topupRepository: Repository<Topup>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
  ) {}

  async paginate(paginateRequestDto: PaginateRequestDto, showPending = false) {
    const {
      search,
      pageSize,
      pageNumber,
      startDate,
      endDate,
      sortBy,
      status,
      filterStatusArray,
      filterChannelArray,
      filterMadeVia,
      filterAmountLower,
      filterAmountUpper,
    } = paginateRequestDto;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const queryBuilder = this.topupRepository
      .createQueryBuilder('topup')
      .leftJoinAndSelect('topup.member', 'member')
      .skip(skip)
      .take(take);

    if (search)
      queryBuilder.andWhere(`topup.systemOrderId ILIKE :search`, {
        search: `%${search}%`,
      });

    let statusFilter = [];

    if (status) statusFilter.push(status);
    else statusFilter.push(OrderStatus.COMPLETE, OrderStatus.FAILED);

    queryBuilder.andWhere(`topup.status IN (:...statusFilter)`, {
      statusFilter,
    });

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

    // Apply filterStatusArray filter
    if (filterStatusArray && filterStatusArray.length > 0) {
      queryBuilder.andWhere('topup.status IN (:...filterStatusArray)', {
        filterStatusArray,
      });
    }

    // Apply filterChannelArray filter
    if (filterChannelArray && filterChannelArray.length > 0) {
      queryBuilder.andWhere('topup.channel IN (:...filterChannelArray)', {
        filterChannelArray,
      });
    }

    // Apply filterMadeVia filter
    if (filterMadeVia && filterMadeVia !== 'BOTH') {
      queryBuilder.andWhere('topup.payinMadeOn = :filterMadeVia', {
        filterMadeVia: filterMadeVia,
      });
    }

    // Apply filterAmountLower and filterAmountUpper filters
    if (filterAmountLower !== undefined && filterAmountLower !== null) {
      queryBuilder.andWhere('topup.amount >= :filterAmountLower', {
        filterAmountLower,
      });
    }

    if (filterAmountUpper !== undefined && filterAmountUpper !== null) {
      queryBuilder.andWhere('topup.amount <= :filterAmountUpper', {
        filterAmountUpper,
      });
    }

    const [rows, total] = await queryBuilder.getManyAndCount();

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    const dtos = await Promise.all(
      rows.map(async (row) => {
        const transactionUpdateMembers =
          await this.transactionUpdateRepository.find({
            where: {
              systemOrderId: row.systemOrderId,
              userType: In([
                UserTypeForTransactionUpdates.MEMBER_BALANCE,
                UserTypeForTransactionUpdates.MEMBER_QUOTA,
              ]),
            },
          });

        const commissions = transactionUpdateMembers.reduce(
          (accumulator, currentValue) => {
            if (
              currentValue.userType ===
              UserTypeForTransactionUpdates.MEMBER_QUOTA
            )
              accumulator.memberCommission += currentValue?.amount;

            if (
              currentValue.userType ===
              UserTypeForTransactionUpdates.MEMBER_BALANCE
            )
              accumulator.memberAgentsCommission += currentValue?.amount;

            return accumulator;
          },
          { memberCommission: 0, memberAgentsCommission: 0 },
        );

        const response = {
          ...row,
          memberCommission: roundOffAmount(commissions.memberCommission),
          totalAgentCommission: roundOffAmount(
            commissions.memberAgentsCommission,
          ),
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
        member:
          this.formatChannelDetails(
            JSON.parse(topup?.transactionDetails)?.member,
          ) || null,
        channelDetails:
          JSON.parse(topup?.transactionDetails)?.channelDetails || null,
      },
      balancesAndProfit: transactionUpdateEntries,
    };

    return plainToInstance(AdminTopupDetailsResponseDto, response);
  }

  async exportRecords(startDate: string, endDate: string) {
    startDate = parseStartDate(startDate);
    endDate = parseEndDate(endDate);
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    const [rows, total] = await this.topupRepository.findAndCount({
      where: {
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
      relations: ['member'],
    });

    const dtos = await Promise.all(
      rows.map(async (row) => {
        const transactionUpdateMembers =
          await this.transactionUpdateRepository.find({
            where: {
              systemOrderId: row.systemOrderId,
              userType: In([
                UserTypeForTransactionUpdates.MEMBER_BALANCE,
                UserTypeForTransactionUpdates.MEMBER_QUOTA,
              ]),
            },
          });

        const commissions = transactionUpdateMembers.reduce(
          (accumulator, currentValue) => {
            if (
              currentValue.userType ===
              UserTypeForTransactionUpdates.MEMBER_QUOTA
            )
              accumulator.memberCommission += currentValue?.amount;

            if (
              currentValue.userType ===
              UserTypeForTransactionUpdates.MEMBER_BALANCE
            )
              accumulator.memberAgentsCommission += currentValue?.amount;

            return accumulator;
          },
          { memberCommission: 0, memberAgentsCommission: 0 },
        );

        const response = {
          ...row,
          memberCommission: roundOffAmount(commissions.memberCommission),
          totalAgentCommission: roundOffAmount(
            commissions.memberAgentsCommission,
          ),
        };

        return plainToInstance(AdminAllTopupResponseDto, response);
      }),
    );

    return {
      total,
      data: dtos,
    };
  }

  formatChannelDetails = (value) => {
    if (value?.upiId)
      return {
        'UPI ID': value?.upiId,
        Mobile: value?.mobile,
      };

    if (value?.app)
      return {
        App: value?.app,
        Mobile: value?.mobile,
      };

    if (value?.bankName) {
      return {
        'Bank Name': value?.bankName,
        'IFSC Code': value?.ifsc,
        'Account Number': value?.accountNumber,
        'Beneficiary Name': value?.beneficiaryName,
      };
    }
  };
}
