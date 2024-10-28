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

@Injectable()
export class PayoutMerchantService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
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
      queryBuilder.andWhere(`CONCAT(payout.merchant) ILIKE :search`, {
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

    const [rows, total] = await queryBuilder.getManyAndCount();

    // return rows;

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
          ...plainToInstance(MerchantAllPayoutResponseDto, row),
          payoutModeVia: row.payoutMadeVia,
          serviceFee: (row.amount * row.merchant.payoutServiceRate) / 100,
          balanceDebit:
            row.amount + (row.amount * row.merchant.payoutServiceRate) / 100,
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
          serviceRate: transactionUpdateMerchant.rate,
          serviceFee: transactionUpdateMerchant.amount,
          balanceDeducted:
            transactionUpdateMerchant.before - transactionUpdateMerchant.after,
        },
      };

      const details = plainToInstance(MerchantPayoutDetailsResponseDto, res);

      return details;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
