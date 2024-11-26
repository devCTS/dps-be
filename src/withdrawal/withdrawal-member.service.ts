import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { Repository } from 'typeorm';
import { Member } from 'src/member/entities/member.entity';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import {
  UserTypeForTransactionUpdates,
  WithdrawalOrderStatus,
} from 'src/utils/enum/enum';
import { plainToInstance } from 'class-transformer';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import {
  WithdrawalDetailsUserResDto,
  WithdrawalUserResponseDto,
} from './dto/withdrawal-user-response.dto';
import { roundOffAmount } from 'src/utils/utils';

@Injectable()
export class WithdrawalMemberService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
  ) {}

  async getChannelProfileDetails(id: number) {
    const member = await this.memberRepository.findOne({
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
    if (!member) throw new NotFoundException('Member not found!');

    const availableChannels: any = [];
    member.identity?.upi?.length && availableChannels.push('upi');
    member.identity?.netBanking?.length && availableChannels.push('netBanking');
    member.identity?.eWallet?.length && availableChannels.push('eWallet');

    const channelProfiles = availableChannels.map((el) => {
      return {
        channelName: el,
        channelDetails: member.identity[el],
      };
    });

    return {
      channelProfiles,
      minWithdrawal: member.minWithdrawalAmount,
      maxWithdrawal: member.maxWithdrawalAmount,
      currentBalance: roundOffAmount(member.balance),
    };
  }

  async paginateWithdrawals(
    paginateRequestDto: PaginateRequestDto,
    userId: number,
  ) {
    const {
      search,
      pageSize,
      pageNumber,
      startDate,
      endDate,
      sortBy,
      forBulletin,
      // userId,
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

  async getOrderDetails(id: string) {
    const orderDetails = await this.withdrawalRepository.findOne({
      where: { systemOrderId: id },
      relations: ['user', 'user.member'],
    });
    if (!orderDetails) throw new NotFoundException('Order not found!');

    const transactionUpdate = await this.transactionUpdateRepository.findOne({
      where: {
        systemOrderId: id,
        userType: UserTypeForTransactionUpdates.MEMBER_BALANCE,
      },
      relations: ['withdrawalOrder'],
    });

    const data = {
      ...orderDetails,
      serviceCharge: roundOffAmount(transactionUpdate?.amount),
      balanceDeducted: roundOffAmount(
        transactionUpdate?.before - transactionUpdate?.after,
      ),
      userChannel: JSON.parse(orderDetails.channelDetails),
      transactionDetails: JSON.parse(orderDetails.transactionDetails),
    };

    return plainToInstance(WithdrawalDetailsUserResDto, data);
  }
}
