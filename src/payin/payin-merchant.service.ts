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

@Injectable()
export class PayinMerchantService {
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
      .leftJoinAndSelect('payin.merchant.identity', 'merchant.identity')
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

    const dtos = await Promise.all(
      rows.map(async (row) => {
        const transactionUpdate =
          await this.transactionUpdateRepository.findOne({
            where: {
              payinOrder: { id: row.id },
              user: { id: row.merchant?.identity?.id },
            },
            relations: ['payinOrder', 'user', 'user.merchant'],
          });

        return {
          ...plainToInstance(PayinMerchantResponseDto, row),
          serviceCharge: transactionUpdate.amount,
          balanceCredit: transactionUpdate.after,
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

  async getPayinDetails(id: number) {
    try {
      const orderDetails = await this.payinRepository.findOne({
        where: { id },
        relations: ['user', 'member', 'merchant'],
      });
      if (!orderDetails) throw new NotFoundException('Order not found.');

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
          serviceRate: orderDetails.merchantCharge,
          serviceFee: (orderDetails.amount / 100) * orderDetails.merchantCharge,
          balanceEarned: orderDetails.amount - orderDetails.merchantCharge,
        },
      };

      const details = plainToInstance(PayinMerchantOrderResDto, res);

      return details;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
