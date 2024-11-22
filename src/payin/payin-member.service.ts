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
  PayinDetailsMemberResDto,
  PayinMemberResponseDto,
} from './dto/payin-member-response.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { OrderStatus } from 'src/utils/enum/enum';
import { roundOffAmount } from 'src/utils/utils';

@Injectable()
export class PayinMemberService {
  constructor(
    @InjectRepository(Payin)
    private payinRepository: Repository<Payin>,
    @InjectRepository(TransactionUpdate)
    private transactionUpdateRepository: Repository<TransactionUpdate>,
  ) {}

  async paginatePayins(paginateRequestDto: PaginateRequestDto) {
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

  async getPayinDetails(id: string) {
    try {
      const orderDetails = await this.payinRepository.findOne({
        where: { systemOrderId: id },
        relations: ['user', 'member', 'merchant', 'member.identity'],
      });
      if (!orderDetails) throw new NotFoundException('Order not found.');

      const transactionUpdate = await this.transactionUpdateRepository.findOne({
        where: {
          systemOrderId: id,
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
          commissionRate: transactionUpdate?.rate,
          commissionAmount: roundOffAmount(transactionUpdate.amount),
          quotaDeducted: roundOffAmount(
            transactionUpdate.after - transactionUpdate.before,
            true,
          ),
          withHeldRate: 50,
          withHeldAmount: roundOffAmount((orderDetails.amount / 100) * 50),
        },
      };

      const details = plainToInstance(PayinDetailsMemberResDto, res);

      return details;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
