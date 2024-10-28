import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payout } from './entities/payout.entity';
import { plainToInstance } from 'class-transformer';
import { MemberPayoutDetailsResponseDto } from './dto/payout-details-response/member-payout-details-response.dto';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { MemberAllPayoutResponseDto } from './dto/paginate-response/member-payout-response.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { OrderStatus } from 'src/utils/enum/enum';

@Injectable()
export class PayoutMemberService {
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

    if (userId) queryBuilder.andWhere('member.id = :userId', { userId });

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
          commission: transactionUpdate.amount,
          quotaCredit: transactionUpdate.after - transactionUpdate.before,
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
        relations: ['user', 'member', 'merchant', 'member.identity'],
      });
      if (!orderDetails) throw new NotFoundException('Order not found.');

      const transactionUpdate = await this.transactionUpdateRepository.findOne({
        where: {
          systemOrderId: id,
          user: { id: orderDetails.member?.identity?.id },
        },
        relations: ['payoutOrder', 'user', 'user.member'],
      });

      return plainToInstance(MemberPayoutDetailsResponseDto, transactionUpdate);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
