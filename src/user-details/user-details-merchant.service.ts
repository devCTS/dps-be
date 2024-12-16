import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { plainToInstance } from 'class-transformer';
import { PayinMerchantResponseDto } from 'src/payin/dto/payin-merchant-response.dto';
import { roundOffAmount } from 'src/utils/utils';
import {
  PaginateRequestDto,
  parseStartDate,
  parseEndDate,
} from 'src/utils/dtos/paginate.dto';
import { Payin } from 'src/payin/entities/payin.entity';
import { Payout } from 'src/payout/entities/payout.entity';
import { Topup } from 'src/topup/entities/topup.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { Withdrawal } from 'src/withdrawal/entities/withdrawal.entity';
import {
  OrderStatus,
  OrderType,
  UserTypeForTransactionUpdates,
  WithdrawalOrderStatus,
} from 'src/utils/enum/enum';
import { MerchantAllPayoutResponseDto } from 'src/payout/dto/paginate-response/merchant-payout-response.dto';
import { WithdrawalUserResponseDto } from 'src/withdrawal/dto/withdrawal-user-response.dto';
import { FundRecord } from 'src/fund-record/entities/fund-record.entity';
import { FundRecordAdminResponseDto } from 'src/fund-record/dto/paginate-response.dto';
import { SystemConfigService } from 'src/system-config/system-config.service';

@Injectable()
export class UserDetailsMerchantService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Payin)
    private readonly payinRepository: Repository<Payin>,
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(Topup)
    private readonly topupRepository: Repository<Topup>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    @InjectRepository(FundRecord)
    private readonly fundRecordRepository: Repository<FundRecord>,

    private readonly systemConfigService: SystemConfigService,
  ) {}

  async getMerchantDetails(userId: number) {
    const merchant = await this.merchantRepository.findOne({
      where: { id: userId },
      relations: ['identity', 'payin', 'identity.withdrawal', 'agent'],
    });
    if (!merchant) throw new NotFoundException('Request merchant not found!');

    const { frozenAmountThreshold } =
      await this.systemConfigService.findLatest();

    const transactionUpdatesMerchant =
      await this.transactionUpdateRepository.find({
        where: {
          user: { id: merchant.identity.id },
        },
        relations: ['user', 'payinOrder', 'payoutOrder', 'withdrawalOrder'],
      });

    const transactionEntries = transactionUpdatesMerchant.reduce(
      (prev, curr) => {
        if (curr.pending === false && curr.after !== curr.before) {
          if (curr.orderType === OrderType.PAYIN) {
            prev.payinFee += curr?.amount;
            prev.payinIncome += curr.payinOrder?.amount;
          }

          if (curr.orderType === OrderType.PAYIN) {
            prev.payoutFee += curr?.amount;
            prev.payoutAmount += curr.payoutOrder?.amount;
          }

          if (curr.orderType === OrderType.WITHDRAWAL) {
            prev.withdrawalFee += curr?.amount;
            prev.withdrawanAmount += curr.withdrawalOrder?.amount;
          }
        }
        return prev;
      },
      {
        payinIncome: 0,
        payinFee: 0,
        payoutAmount: 0,
        payoutFee: 0,
        withdrawanAmount: 0,
        withdrawalFee: 0,
      },
    );

    const totalWithdrawalsFrozenAmount = merchant.identity.withdrawal.reduce(
      (prev, curr) => {
        if (curr.status === WithdrawalOrderStatus.PENDING) {
          const currentDate = new Date();
          const withdrawalDate = new Date(curr.createdAt);
          const diffInTime = currentDate.getTime() - withdrawalDate.getTime();
          const diffInDays = diffInTime / (1000 * 3600 * 24);

          if (diffInDays > frozenAmountThreshold) prev += curr.amount;
        }
        return prev;
      },
      0,
    );

    const totalPayoutsFrozenAmount = merchant.payout?.reduce((prev, curr) => {
      if (
        curr.status !== OrderStatus.COMPLETE &&
        curr.status !== OrderStatus.FAILED
      ) {
        const currentDate = new Date();
        const payoutDate = new Date(curr.createdAt);
        const diffInTime = currentDate.getTime() - payoutDate.getTime();
        const diffInDays = diffInTime / (1000 * 3600 * 24);

        if (diffInDays > frozenAmountThreshold) prev += curr.amount;
      }
      return prev;
    }, 0);

    return {
      name: merchant.firstName + ' ' + merchant.lastName,
      role: 'MERCHANT',
      email: merchant.identity.email,
      phone: merchant.phone,
      joinedOn: merchant.createdAt,
      status: merchant.enabled,
      referral: merchant?.agent
        ? merchant?.agent?.firstName + ' ' + merchant?.agent?.lastName
        : 'None',
      organizationId: merchant?.organizationId,
      balance: roundOffAmount(merchant.balance),
      payinIncome: roundOffAmount(transactionEntries.payinIncome),
      payinFee: roundOffAmount(transactionEntries.payinFee),
      payoutAmount: roundOffAmount(transactionEntries.payoutAmount),
      payoutFee: roundOffAmount(transactionEntries.payoutFee),
      withdrawanAmount: roundOffAmount(transactionEntries.withdrawanAmount),
      withdrawalFee: roundOffAmount(transactionEntries.withdrawalFee),
      frozenAmount: roundOffAmount(
        totalPayoutsFrozenAmount + totalWithdrawalsFrozenAmount,
      ),
    };
  }

  async paginateMerchantPayins(paginateRequestDto: PaginateRequestDto) {
    const { search, pageSize, pageNumber, startDate, endDate, sortBy, userId } =
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

    if (userId) queryBuilder.andWhere('merchant.id = :userId', { userId });

    if (search)
      queryBuilder.andWhere(`CONCAT(payin.systemOrderId) ILIKE :search`, {
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

    if (sortBy)
      sortBy === 'latest'
        ? queryBuilder.orderBy('payin.createdAt', 'DESC')
        : queryBuilder.orderBy('payin.createdAt', 'ASC');

    const [rows, total] = await queryBuilder.getManyAndCount();

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    const dtos = await Promise.all(
      rows.map(async (row) => {
        const transactionUpdate =
          await this.transactionUpdateRepository.findOne({
            where: {
              systemOrderId: row.systemOrderId,
              user: { id: row.merchant?.identity?.id },
            },
            relations: ['payinOrder', 'user', 'user.merchant'],
          });

        const response = {
          ...row,
          serviceCharge: roundOffAmount(transactionUpdate?.amount),
          balanceCredit: roundOffAmount(
            transactionUpdate.after - transactionUpdate.before,
          ),
        };

        return plainToInstance(PayinMerchantResponseDto, response);
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

  async paginateMerchantPayouts(
    paginateRequestDto: PaginateRequestDto,
    showPending = false,
  ) {
    const {
      search,
      pageSize,
      pageNumber,
      startDate,
      endDate,
      sortBy,
      userId,
      forBulletin,
    } = paginateRequestDto;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const queryBuilder = this.payoutRepository
      .createQueryBuilder('payout')
      .leftJoinAndSelect('payout.merchant', 'merchant')
      .leftJoinAndSelect('payout.user', 'user')
      .leftJoinAndSelect('payout.member', 'member')
      .leftJoinAndSelect('member.identity', 'identity')
      .skip(skip)
      .take(take);

    if (userId) queryBuilder.andWhere('merchant.id = :userId', { userId });

    if (forBulletin)
      queryBuilder.andWhere('payout.status = :status', {
        status: OrderStatus.SUBMITTED,
      });

    if (search)
      queryBuilder.andWhere(
        `CONCAT(payout.systemOrderId, ' ', user.name) ILIKE :search`,
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

    if (sortBy)
      sortBy === 'latest'
        ? queryBuilder.orderBy('payout.createdAt', 'DESC')
        : queryBuilder.orderBy('payout.createdAt', 'ASC');

    const [rows, total] = await queryBuilder.getManyAndCount();

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    const dtos = await Promise.all(
      rows.map(async (row) => {
        const transactionUpdate =
          await this.transactionUpdateRepository.findOne({
            where: {
              systemOrderId: row.systemOrderId,
              user: { id: row.merchant?.identity?.id },
            },
            relations: ['payoutOrder', 'user', 'user.member'],
          });

        return {
          ...plainToInstance(MerchantAllPayoutResponseDto, row),
          member: row?.member
            ? row.member?.firstName + ' ' + row.member?.lastName
            : null,
          serviceFee: row?.merchant?.payoutServiceRate
            ? roundOffAmount(transactionUpdate?.amount)
            : 0,
          balanceDebit:
            row.status === OrderStatus.FAILED
              ? 0
              : roundOffAmount(row?.amount + transactionUpdate?.amount, true),
          channelDetails: row.user.channelDetails,
        };
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

  async paginateMerchantWithdrawals(paginateRequestDto: PaginateRequestDto) {
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
          serviceCharge: roundOffAmount(transactionUpdate?.amount) || 0,
          balanceAfter: roundOffAmount(transactionUpdate?.after) || 0,
          balanceBefore: roundOffAmount(transactionUpdate?.before) || 0,
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

  async paginateMerchantFundRecords(paginateRequestDto: PaginateRequestDto) {
    const {
      search,
      pageSize,
      pageNumber,
      startDate,
      endDate,
      sortBy,
      balanceType,
      userEmail,
    } = paginateRequestDto;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const queryBuilder = this.fundRecordRepository
      .createQueryBuilder('fundRecord')
      .leftJoinAndSelect('fundRecord.user', 'user')
      .skip(skip)
      .take(take);

    if (userEmail)
      queryBuilder.andWhere('user.email = :userEmail', { userEmail });

    if (search)
      queryBuilder.andWhere(
        `CONCAT(fundRecord.systemOrderId, ' ', fundRecord.name) ILIKE :search`,
        {
          search: `%${search}%`,
        },
      );

    if (startDate && endDate) {
      const parsedStartDate = parseStartDate(startDate);
      const parsedEndDate = parseEndDate(endDate);

      queryBuilder.andWhere(
        'fundRecord.created_at BETWEEN :startDate AND :endDate',
        {
          startDate: parsedStartDate,
          endDate: parsedEndDate,
        },
      );
    }

    if (sortBy)
      sortBy === 'latest'
        ? queryBuilder.orderBy('fundRecord.createdAt', 'DESC')
        : queryBuilder.orderBy('fundRecord.createdAt', 'ASC');

    if (balanceType)
      queryBuilder.andWhere('fundRecord.balanceType = :balanceType', {
        balanceType: balanceType,
      });

    const [rows, total] = await queryBuilder.getManyAndCount();

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    return {
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
      data: plainToInstance(FundRecordAdminResponseDto, rows),
    };
  }
}
