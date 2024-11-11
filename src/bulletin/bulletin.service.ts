import { Injectable } from '@nestjs/common';
import { PayinMemberService } from 'src/payin/payin-member.service';
import { PayoutMemberService } from 'src/payout/payout-member.service';
import { TopupMemberService } from 'src/topup/topup-member.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';

@Injectable()
export class BulletinService {
  constructor(
    private topupMemberService: TopupMemberService,
    private payoutMemberService: PayoutMemberService,
    private payinMemberService: PayinMemberService,
  ) {}

  async getGrabOrders() {
    const dto: PaginateRequestDto = {
      search: '',
      pageSize: Number.MAX_SAFE_INTEGER,
      pageNumber: 1,
      startDate: null,
      endDate: null,
      sortBy: null,
      userId: null,
      forBulletin: true,
      forPendingOrder: false,
    };

    const topupOrders: any[] = (
      await this.topupMemberService.paginate(dto)
    ).data.map((order) => ({ ...order, type: 'topup' }));

    const payoutOrders: any[] = (
      await this.payoutMemberService.paginate(dto)
    ).data.map((order) => ({ ...order, type: 'payout' }));

    const allOrders: any[] = [...topupOrders, ...payoutOrders];

    return allOrders.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async getPendingOrders(id: number) {
    const dto: PaginateRequestDto = {
      search: '',
      pageSize: Number.MAX_SAFE_INTEGER,
      pageNumber: 1,
      startDate: null,
      endDate: null,
      sortBy: null,
      userId: id,
      forBulletin: false,
      forPendingOrder: true,
    };

    const payinOrders: any[] = (
      await this.payinMemberService.paginatePayins({
        ...dto,
        forBulletin: true,
      })
    ).data.map((order) => ({ ...order, type: 'payin' }));

    const topupOrders: any[] = (
      await this.topupMemberService.paginate(dto)
    ).data.map((order) => ({ ...order, type: 'topup' }));

    const payoutOrders: any[] = (
      await this.payoutMemberService.paginate(dto)
    ).data.map((order) => ({ ...order, type: 'payout' }));

    const allOrders: any[] = [...payinOrders, ...topupOrders, ...payoutOrders];

    return allOrders.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}
