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
import { memberAllPayins } from './data/dummy-data';
import { SortedBy } from 'src/utils/enum/enum';
import {
  PayinDetailsMemberResDto,
  PayinMemberResponseDto,
} from './dto/payin-member-response.dto';
import { memberPayinOrders } from './data/dummy-order-details';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';

@Injectable()
export class PayinMemberService {
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
      .leftJoinAndSelect('payin.user', 'user')
      .leftJoinAndSelect('payin.member', 'member')
      .leftJoinAndSelect('member.identity', 'identity')
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
              user: { id: row.member?.identity?.id },
            },
            relations: ['payinOrder', 'user', 'user.member'],
          });

        return {
          ...plainToInstance(PayinMemberResponseDto, row),
          commission: transactionUpdate.amount,
          quotaDebit: transactionUpdate.after - transactionUpdate.before,
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
        relations: ['user', 'member', 'merchant', 'member.identity'],
      });
      if (!orderDetails) throw new NotFoundException('Order not found.');

      const transactionUpdate = await this.transactionUpdateRepository.findOne({
        where: {
          payinOrder: { id },
          user: { id: orderDetails.member?.identity?.id },
        },
        relations: ['payinOrder', 'user', 'user.member'],
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
        quotaDetails: {
          commissionRate: transactionUpdate.rate,
          commissionAmount: transactionUpdate.amount,
          quotaDeducted: transactionUpdate.after - transactionUpdate.before,
          withHeldAmount:
            (orderDetails.amount / 100) * orderDetails.member.withdrawalRate,
          withHeldRate: orderDetails.member.withdrawalRate,
        },
      };

      const details = plainToInstance(PayinDetailsMemberResDto, res);

      return details;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
