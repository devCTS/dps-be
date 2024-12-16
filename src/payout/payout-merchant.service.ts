import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payout } from './entities/payout.entity';
import { plainToInstance } from 'class-transformer';
import { MerchantPayoutDetailsResponseDto } from './dto/payout-details-response/merchant-payout-details-response.dto';
import { MerchantAllPayoutResponseDto } from './dto/paginate-response/merchant-payout-response.dto';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import {
  OrderStatus,
  UserTypeForTransactionUpdates,
} from 'src/utils/enum/enum';
import { getServicerRateForMerchant, roundOffAmount } from 'src/utils/utils';
import { EndUser } from 'src/end-user/entities/end-user.entity';

@Injectable()
export class PayoutMerchantService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(EndUser)
    private readonly endUserRepository: Repository<EndUser>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
  ) {}

  async paginate(
    paginateRequestDto: PaginateRequestDto,
    userId,
    showPending = false,
  ) {
    const {
      search,
      pageSize,
      pageNumber,
      startDate,
      endDate,
      sortBy,
      // userId,
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

  async paginateMerchantUsers(
    paginateRequestDto: PaginateRequestDto,
    userId: number,
  ) {
    const { search, pageSize, pageNumber, startDate, endDate, sortBy } =
      paginateRequestDto;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const queryBuilder = this.endUserRepository
      .createQueryBuilder('endUser')
      .leftJoinAndSelect('endUser.merchant', 'merchant')
      .skip(skip)
      .take(take);

    if (userId) queryBuilder.andWhere('merchant.id = :userId', { userId });

    if (search)
      queryBuilder.andWhere(`CONCAT(endUser.name) ILIKE :search`, {
        search: `%${search}%`,
      });

    if (startDate && endDate) {
      const parsedStartDate = parseStartDate(startDate);
      const parsedEndDate = parseEndDate(endDate);

      queryBuilder.andWhere(
        'endUser.created_at BETWEEN :startDate AND :endDate',
        {
          startDate: parsedStartDate,
          endDate: parsedEndDate,
        },
      );
    }

    if (sortBy)
      sortBy === 'latest'
        ? queryBuilder.orderBy('endUser.createdAt', 'DESC')
        : queryBuilder.orderBy('endUser.createdAt', 'ASC');

    const [rows, total] = await queryBuilder.getManyAndCount();

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    const dtos = await Promise.all(
      rows.map(async (row) => {
        return {
          name: row.name,
          channel: row.channel,
          channelDetails: row.channelDetails,
          email: row.email,
          mobile: row.mobile,
          totalPayinAmount: row.totalPayinAmount,
          totalPayoutAmount: row.totalPayoutAmount,
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

  async getPayoutDetails(id: string) {
    try {
      const orderDetails = await this.payoutRepository.findOne({
        where: { systemOrderId: id },
        relations: ['user', 'merchant', 'member'],
      });
      if (!orderDetails) throw new NotFoundException('Order not found.');

      const transactionUpdateMerchant =
        await this.transactionUpdateRepository.findOne({
          where: {
            systemOrderId: id,
            userType: UserTypeForTransactionUpdates.MERCHANT_BALANCE,
            user: { id: orderDetails.merchant?.identity?.id },
          },
          relations: ['payinOrder', 'user', 'user.merchant'],
        });

      const res = {
        ...orderDetails,
        transactionDetails: {
          transactionId: orderDetails.transactionId,
          receipt: orderDetails.transactionReceipt,
          member: orderDetails.member
            ? JSON.parse(orderDetails.transactionDetails)
            : null,
          gateway: orderDetails.gatewayName
            ? JSON.parse(orderDetails.transactionDetails)
            : null,
        },
        balanceDetails: {
          serviceRate: getServicerRateForMerchant(
            transactionUpdateMerchant?.absoluteAmount,
            transactionUpdateMerchant?.rate,
          ),
          serviceFee: roundOffAmount(transactionUpdateMerchant.amount),
          balanceDeducted:
            orderDetails.status === OrderStatus.FAILED
              ? 0
              : roundOffAmount(
                  orderDetails.amount + transactionUpdateMerchant.amount,
                  true,
                ),
        },
        channelDetails: orderDetails.user.channelDetails,
      };

      const details = plainToInstance(MerchantPayoutDetailsResponseDto, res);

      return details;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async confirmAndGetEndUserDetails(userId) {
    const endUser = await this.endUserRepository.findOne({
      where: {
        userId,
      },
    });
    if (!endUser) throw new NotFoundException('User with this ID not found!');

    return {
      name: endUser.name,
      mobile: endUser.mobile,
      email: endUser.email,
      channelDetails: endUser.channelDetails,
    };
  }
}
