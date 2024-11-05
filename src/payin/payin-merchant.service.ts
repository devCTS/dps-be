import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
  PayinMerchantOrderResDto,
  PayinMerchantResponseDto,
} from './dto/payin-merchant-response.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';

@Injectable()
export class PayinMerchantService {
  constructor(
    @InjectRepository(Payin)
    private payinRepository: Repository<Payin>,
    @InjectRepository(TransactionUpdate)
    private transactionUpdateRepository: Repository<TransactionUpdate>,
  ) {}

  async paginatePayins(paginateRequestDto: PaginateRequestDto) {
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
          serviceCharge: transactionUpdate?.amount,
          balanceCredit: transactionUpdate.after - transactionUpdate.before,
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

  async getPayinDetails(id: string) {
    try {
      const orderDetails = await this.payinRepository.findOne({
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
          serviceFee: transactionUpdateMerchant?.amount,
          balanceEarned:
            transactionUpdateMerchant.after - transactionUpdateMerchant.before,
        },
      };

      const details = plainToInstance(PayinMerchantOrderResDto, res);

      return details;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
