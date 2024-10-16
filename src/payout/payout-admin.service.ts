import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payout } from './entities/payout.entity';
import { plainToInstance } from 'class-transformer';
import { AdminPayoutDetailsResponseDto } from './dto/payout-details-response/admin-payout-details-response.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { AdminPayoutResponseDto } from './dto/paginate-response/admin-payout-response.dto';

@Injectable()
export class PayoutAdminService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
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

  async getPayoutDetails(id: number) {
    const payout = await this.payoutRepository.findOne({
      where: { id },
      relations: [],
    });

    if (!payout) throw new NotFoundException('Order not found!');

    return plainToInstance(AdminPayoutDetailsResponseDto, payout);
  }
}
