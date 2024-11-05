import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topup } from './entities/topup.entity';
import { plainToInstance } from 'class-transformer';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { MemberAllTopupResponseDto } from './dto/paginate-response/member-topup-response.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { OrderStatus } from 'src/utils/enum/enum';
import { MemberTopupDetailsResponseDto } from './dto/topup-details-response/member-topup-details-response.dto';

@Injectable()
export class TopupMemberService {
  constructor(
    @InjectRepository(Topup)
    private readonly topupRepository: Repository<Topup>,
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

    const queryBuilder = this.topupRepository
      .createQueryBuilder('topup')
      .leftJoinAndSelect('topup.member', 'member')
      .leftJoinAndSelect('member.identity', 'identity')
      .skip(skip)
      .take(take);

    if (userId) queryBuilder.andWhere('member.id = :userId', { userId });

    if (forBulletin)
      queryBuilder.andWhere('topup.status = :status', {
        status: OrderStatus.SUBMITTED,
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
          commission: transactionUpdate?.amount || null,
          quotaCredit:
            transactionUpdate?.after - transactionUpdate?.before || null,
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

  async getTopupDetails(id: string) {
    try {
      const orderDetails = await this.topupRepository.findOne({
        where: { systemOrderId: id },
        relations: ['member', 'member.identity'],
      });

      if (!orderDetails) throw new NotFoundException('Order not found.');

      const transactionUpdate = await this.transactionUpdateRepository.findOne({
        where: {
          systemOrderId: id,
          user: { id: orderDetails.member?.identity?.id },
        },
        relations: ['topupOrder', 'user', 'user.member'],
      });

      if (!transactionUpdate) throw new NotFoundException();

      const responseData = {
        ...orderDetails,
        quotaDetails: {
          commissionRate: transactionUpdate.rate,
          commissionAmount: transactionUpdate.amount,
          quotaEarned: orderDetails.amount + transactionUpdate.amount,
        },
        transactionDetails: {
          transactionId: orderDetails.transactionId,
          receipt: orderDetails.transactionReceipt,
          member: JSON.parse(orderDetails.transactionDetails),
        },
      };

      return {
        ...plainToInstance(MemberTopupDetailsResponseDto, responseData),
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
