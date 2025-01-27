import { Injectable } from '@nestjs/common';
import { Payin } from 'src/payin/entities/payin.entity';
import { OrderStatus } from 'src/utils/enum/enum';

@Injectable()
export class MemberChannelService {
  async getPayPage(systemOrderId) {
    return {
      url: `${process.env.PAYMENT_PAGE_BASE_URL}/payment/${systemOrderId}`,
    };
  }

  async getPaymentStatus(payinOrder: Payin) {
    let status = 'PENDING';

    if (payinOrder.status === OrderStatus.COMPLETE) status = 'SUCCESS';

    if (payinOrder.status === OrderStatus.FAILED) status = 'FAILED';

    return { status };
  }
}
