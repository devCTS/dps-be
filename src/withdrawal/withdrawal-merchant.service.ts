import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { Repository } from 'typeorm';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { plainToInstance } from 'class-transformer';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import {
  UserTypeForTransactionUpdates,
  WithdrawalOrderStatus,
} from 'src/utils/enum/enum';
import {
  WithdrawalDetailsUserResDto,
  WithdrawalUserResponseDto,
} from './dto/withdrawal-user-response.dto';

@Injectable()
export class WithdrawalMerchantService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
  ) {}

  async getChannelProfileDetails(id: number) {
    const merchant = await this.merchantRepository.findOne({
      where: {
        id,
      },
      relations: [
        'identity',
        'identity.upi',
        'identity.netBanking',
        'identity.eWallet',
      ],
    });
    if (!merchant) throw new NotFoundException('Merchant not found!');

    const availableChannels: any = [];
    merchant.identity?.upi?.length && availableChannels.push('upi');
    merchant.identity?.netBanking?.length &&
      availableChannels.push('netBanking');
    merchant.identity?.eWallet?.length && availableChannels.push('eWallet');

    const channelProfiles = availableChannels.map((el) => {
      return {
        channelName: el,
        channelDetails: merchant.identity[el],
      };
    });

    return {
      channelProfiles,
      minWithdrawal: merchant.minWithdrawal,
      maxWithdrawal: merchant.maxWithdrawal,
      currentBalance: merchant.balance,
    };
  }

  async paginateWithdrawals(paginateRequestDto: PaginateRequestDto) {
    const {
      search,
      pageSize,
      pageNumber,
      startDate,
      endDate,
      sortBy,
      forBulletin,
      userId,
    } = paginateRequestDto;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const queryBuilder = this.withdrawalRepository
      .createQueryBuilder('withdrawal')
      .leftJoinAndSelect('withdrawal.user', 'user')
      .leftJoinAndSelect('user.merchant', 'merchant')
      .skip(skip)
      .take(take);

    if (userId) queryBuilder.andWhere('merchant.id = :userId', { userId });

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
        const transactionUpdate =
          await this.transactionUpdateRepository.findOne({
            where: {
              systemOrderId: row.systemOrderId,
              userType: UserTypeForTransactionUpdates.MERCHANT_BALANCE,
            },
          });

        const response = {
          ...row,
          serviceCharge: transactionUpdate?.amount || null,
          balanceAfter: transactionUpdate?.after || null,
          balanceBefore: transactionUpdate?.before || null,
          date: row.createdAt,
        };

        return plainToInstance(WithdrawalUserResponseDto, response);
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
      relations: ['user', 'user.merchant'],
    });
    if (!orderDetails) throw new NotFoundException('Order not found!');

    const transactionUpdate = await this.transactionUpdateRepository.findOne({
      where: {
        systemOrderId: id,
        userType: UserTypeForTransactionUpdates.MERCHANT_BALANCE,
      },
      relations: ['withdrawalOrder'],
    });

    const data = {
      ...orderDetails,
      serviceCharge: transactionUpdate?.amount || null,
      balanceDeducted:
        transactionUpdate?.before - transactionUpdate?.after || null,
      userChannel: JSON.parse(orderDetails.channelDetails),
      transactionDetails: JSON.parse(orderDetails.transactionDetails),
    };

    return plainToInstance(WithdrawalDetailsUserResDto, data);
  }
}
