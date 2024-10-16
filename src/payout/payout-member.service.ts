import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payout } from './entities/payout.entity';
import { plainToInstance } from 'class-transformer';
import { MemberPayoutDetailsResponseDto } from './dto/payout-details-response/member-payout-details-response.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { MemberPayoutResponseDto } from './dto/paginate-response/member-payout-response.dto';

@Injectable()
export class PayoutMemberService {
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
      data: plainToInstance(MemberPayoutResponseDto, rows),
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

    return plainToInstance(MemberPayoutDetailsResponseDto, payout);
  }
}
