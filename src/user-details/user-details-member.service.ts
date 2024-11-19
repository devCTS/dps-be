import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from 'src/member/entities/member.entity';
import { roundOffAmount } from 'src/utils/utils';
import { plainToInstance } from 'class-transformer';
import { PayinMemberResponseDto } from 'src/payin/dto/payin-member-response.dto';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import {
  OrderStatus,
  OrderType,
  UserTypeForTransactionUpdates,
  WithdrawalOrderStatus,
} from 'src/utils/enum/enum';
import { Payin } from 'src/payin/entities/payin.entity';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { MemberAllPayoutResponseDto } from 'src/payout/dto/paginate-response/member-payout-response.dto';
import { Payout } from 'src/payout/entities/payout.entity';
import { Withdrawal } from 'src/withdrawal/entities/withdrawal.entity';
import { Topup } from 'src/topup/entities/topup.entity';
import { WithdrawalUserResponseDto } from 'src/withdrawal/dto/withdrawal-user-response.dto';
import { MemberAllTopupResponseDto } from 'src/topup/dto/paginate-response/member-topup-response.dto';
import { CommissionsAdminPaginateResponseDto } from 'src/transaction-updates/dto/commissions-paginate.dto';
import { FundRecord } from 'src/fund-record/entities/fund-record.entity';
import { FundRecordAdminResponseDto } from 'src/fund-record/dto/paginate-response.dto';

@Injectable()
export class UserDetailsMemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
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
  ) {}

  async getMemberDetails(userId: number) {
    const member = await this.memberRepository.findOne({
      where: { id: userId },
      relations: ['identity', 'memberReferral'],
    });
    if (!member) throw new NotFoundException('Request member not found!');

    return {
      name: member.firstName + ' ' + member.lastName,
      role: 'MEMBER',
      email: member.identity.email,
      phone: member.phone,
      joinedOn: member.createdAt,
      status: member.enabled,
      balance: member.balance,
      quota: member.quota,
      referral:
        member?.memberReferral?.member?.firstName +
          ' ' +
          member?.memberReferral?.member?.lastName || 'None',
    };
  }

  async paginateMemberPayins(paginateRequestDto: PaginateRequestDto) {
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

    const queryBuilder = this.payinRepository
      .createQueryBuilder('payin')
      .leftJoinAndSelect('payin.merchant', 'merchant')
      .leftJoinAndSelect('payin.user', 'user')
      .leftJoinAndSelect('payin.member', 'member')
      .leftJoinAndSelect('member.identity', 'identity')
      .skip(skip)
      .take(take);

    if (userId) queryBuilder.andWhere('member.id = :userId', { userId });

    if (forBulletin)
      queryBuilder.andWhere('payin.status = :status', {
        status: OrderStatus.SUBMITTED,
      });

    if (search)
      queryBuilder.andWhere(`CONCAT(payin.systemOrderId) ILIKE :search`, {
        search: `%${search}%`,
      });

    if (sortBy)
      sortBy === 'latest'
        ? queryBuilder.orderBy('payin.createdAt', 'DESC')
        : queryBuilder.orderBy('payin.createdAt', 'ASC');

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
        const transactionUpdate =
          await this.transactionUpdateRepository.findOne({
            where: {
              systemOrderId: row.systemOrderId,
              user: { id: row.member?.identity?.id },
            },
            relations: ['payinOrder', 'user', 'user.member'],
          });

        return {
          ...plainToInstance(PayinMemberResponseDto, row),
          commission: roundOffAmount(transactionUpdate?.amount),
          quotaDebit: roundOffAmount(
            transactionUpdate?.after - transactionUpdate?.before,
            true,
          ),
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

  async paginateMemberPayouts(
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
      forPendingOrder,
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

    if (userId) queryBuilder.andWhere('member.id = :userId', { userId });

    if (forBulletin)
      queryBuilder.andWhere('payout.status = :status', {
        status: OrderStatus.INITIATED,
      });

    if (forPendingOrder)
      queryBuilder.andWhere('payout.status = :status', {
        status: OrderStatus.ASSIGNED,
      });

    if (search)
      queryBuilder.andWhere(`CONCAT(payout.systemOrderId) ILIKE :search`, {
        search: `%${search}%`,
      });

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
              user: { id: row.member?.identity?.id },
            },
            relations: ['payoutOrder', 'user', 'user.member'],
          });

        return {
          ...plainToInstance(MemberAllPayoutResponseDto, row),
          commission: roundOffAmount(transactionUpdate?.amount),
          quotaCredit:
            row.status === OrderStatus.FAILED
              ? 0
              : roundOffAmount(row?.amount + transactionUpdate?.amount, true),
          orderType: 'Payout',
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

  async paginateMemberWithdrawals(paginateRequestDto: PaginateRequestDto) {
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
      .leftJoinAndSelect('user.member', 'member')
      .skip(skip)
      .take(take);

    if (userId) queryBuilder.andWhere('member.id = :userId', { userId });

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
              userType: UserTypeForTransactionUpdates.MEMBER_BALANCE,
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

  async paginateMemberTopups(
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
      forPendingOrder,
    } = paginateRequestDto;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const queryBuilder = this.topupRepository
      .createQueryBuilder('topup')
      .leftJoinAndSelect('topup.member', 'member')
      .leftJoinAndSelect('member.identity', 'identity')
      .skip(skip)
      .take(take);

    if (userId) queryBuilder.andWhere('member.id = :userId', { userId });

    if (forBulletin)
      queryBuilder.andWhere('topup.status = :status', {
        status: OrderStatus.INITIATED,
      });

    if (forPendingOrder)
      queryBuilder.andWhere('topup.status = :status', {
        status: OrderStatus.ASSIGNED,
      });

    if (search)
      queryBuilder.andWhere(`CONCAT(topup.systemOrderId) ILIKE :search`, {
        search: `%${search}%`,
      });

    if (sortBy)
      sortBy === 'latest'
        ? queryBuilder.orderBy('topup.createdAt', 'DESC')
        : queryBuilder.orderBy('topup.createdAt', 'ASC');

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

    const dtos = await Promise.all(
      rows.map(async (row) => {
        const transactionUpdate =
          await this.transactionUpdateRepository.findOne({
            where: {
              systemOrderId: row.systemOrderId,
              user: { id: row.member?.identity?.id },
            },
            relations: ['topupOrder', 'user'],
          });

        return {
          ...plainToInstance(MemberAllTopupResponseDto, row),
          commission: roundOffAmount(transactionUpdate?.amount) || null,
          quotaCredit:
            roundOffAmount(
              transactionUpdate?.after - transactionUpdate?.before,
            ) || null,
          orderType: 'Topup',
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
      data: sortBy === 'latest' ? dtos.reverse() : dtos,
    };
  }

  async paginateMemberCommissions(paginateRequestDto: PaginateRequestDto) {
    const {
      startDate,
      endDate,
      search,
      pageNumber,
      pageSize,
      userEmail,
      sortBy,
    } = paginateRequestDto;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const queryBuilder = this.transactionUpdateRepository
      .createQueryBuilder('transactionUpdate')
      .leftJoinAndSelect('transactionUpdate.user', 'user')
      .skip(skip)
      .take(take);

    if (userEmail)
      queryBuilder.andWhere('user.email = :userEmail', { userEmail });

    if (search)
      queryBuilder.andWhere(
        `CONCAT(transactionUpdate.systemOrderId) ILIKE :search`,
        { search: `%${search}%` },
      );

    if (startDate && endDate) {
      const parsedStartDate = parseStartDate(startDate);
      const parsedEndDate = parseEndDate(endDate);

      queryBuilder.andWhere(
        'transactionUpdate.created_at BETWEEN :startDate AND :endDate',
        {
          startDate: parsedStartDate,
          endDate: parsedEndDate,
        },
      );
    }

    if (sortBy)
      sortBy === 'latest'
        ? queryBuilder.orderBy('transactionUpdate.createdAt', 'DESC')
        : queryBuilder.orderBy('transactionUpdate.createdAt', 'ASC');

    queryBuilder.andWhere(
      'transactionUpdate.userType IN (:agentCommission, :memberCommission)',
      {
        agentCommission: UserTypeForTransactionUpdates.AGENT_BALANCE,
        memberCommission: UserTypeForTransactionUpdates.MEMBER_BALANCE,
      },
    );
    queryBuilder.andWhere('transactionUpdate.pending = false');
    queryBuilder.andWhere(
      'NOT transactionUpdate.before = transactionUpdate.after',
    );
    queryBuilder.andWhere('transactionUpdate.orderType IN (:...orderType)', {
      orderType: [OrderType.PAYIN, OrderType.PAYOUT, OrderType.TOPUP],
    });

    const [rows, total] = await queryBuilder.getManyAndCount();

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    const dtos = await Promise.all(
      rows.map(async (row) => {
        const mapOrderType = {
          Payin: 'payinOrder',
          Payout: 'payoutOrder',
          Topup: 'topupOrder',
        };
        const orderType = mapOrderType[row.orderType];

        const merchantRow = await this.transactionUpdateRepository.findOne({
          where: {
            systemOrderId: row.systemOrderId,
            userType: UserTypeForTransactionUpdates.MERCHANT_BALANCE,
          },
          relations: ['payinOrder', 'payoutOrder', 'topupOrder'],
        });

        let orderRow;
        switch (orderType) {
          case 'payinOrder':
            orderRow = await this.payinRepository.findOneBy({
              systemOrderId: row.systemOrderId,
            });
            break;
          case 'payoutOrder':
            orderRow = await this.payoutRepository.findOneBy({
              systemOrderId: row.systemOrderId,
            });
            break;
          case 'topupOrder':
            orderRow = await this.topupRepository.findOneBy({
              systemOrderId: row.systemOrderId,
            });
            break;
        }

        const payload = {
          orderId: row.systemOrderId,
          orderType: row.orderType.toLowerCase(),
          agentMember: row?.name,
          merchant: orderType === 'topupOrder' ? 'None' : merchantRow?.name,
          merchantFees: orderType === 'topupOrder' ? 0 : merchantRow?.amount,
          orderAmount: roundOffAmount(orderRow?.amount) || 0,
          commission: row?.amount || 0,
          date: row.createdAt,
          referralUser: row?.isAgentOf,
        };

        return plainToInstance(CommissionsAdminPaginateResponseDto, payload);
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

  async paginateMemberFundRecords(paginateRequestDto: PaginateRequestDto) {
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
