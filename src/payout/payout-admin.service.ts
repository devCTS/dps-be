import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payout } from './entities/payout.entity';
import { plainToInstance } from 'class-transformer';
import { AdminPayoutDetailsResponseDto } from './dto/payout-details-response/admin-payout-details-response.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { AdminPayoutResponseDto } from './dto/paginate-response/admin-payout-response.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';

@Injectable()
export class PayoutAdminService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
  ) {}

  async paginate(paginateRequestDto: PaginateRequestDto, showPending = false) {
    const { search, pageSize, pageNumber, startDate, endDate, userId } =
      paginateRequestDto;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const [rows, total] = await this.payoutRepository.findAndCount({
      relations: [],
      skip,
      take,
    });

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    return {
      data: plainToInstance(AdminPayoutResponseDto, rows),
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
    };
  }

  async getPayoutDetails(id: string) {
    const payout = await this.payoutRepository.findOne({
      where: { systemOrderId: id },
      relations: ['user', 'merchant', 'member'],
    });
    if (!payout) throw new NotFoundException('Order not found!');

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId: id,
        },
        relations: ['payoutOrder', 'user'],
      });

    const response = {
      ...payout,
      transactionDetails: {
        transactionId: payout.transactionId,
        receipt: payout.transactionReceipt,
        member: payout.member ? JSON.parse(payout.transactionDetails) : null,
        gateway: payout.gatewayName
          ? JSON.parse(payout.transactionDetails)
          : null,
      },
      balancesAndProfit: transactionUpdateEntries,
    };

    return plainToInstance(AdminPayoutDetailsResponseDto, response);
  }
}
