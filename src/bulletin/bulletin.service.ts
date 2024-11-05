import { Injectable } from '@nestjs/common';
import { PayoutMemberService } from 'src/payout/payout-member.service';
import { TopupMemberService } from 'src/topup/topup-member.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';

@Injectable()
export class BulletinService {
  constructor(
    private topupMemberService: TopupMemberService,
    private payoutMemberService: PayoutMemberService,
  ) {}

  async paginate(paginateRequestDto: PaginateRequestDto) {
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

    const topupOrders = (
      await this.topupMemberService.paginate(paginateRequestDto)
    ).data;
    const payoutOrders = (
      await this.payoutMemberService.paginate(paginateRequestDto)
    ).data;

    const allOrders = [...topupOrders, ...payoutOrders];

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, allOrders.length);

    return {
      total: allOrders.length,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(allOrders.length / pageSize),
      startRecord,
      endRecord,
      data: sortBy === 'latest' ? allOrders.reverse() : allOrders,
    };
  }
}
