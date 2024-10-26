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
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { MemberPayoutResponseDto } from './dto/paginate-response/member-payout-response.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';

@Injectable()
export class PayoutMemberService {
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
      data: plainToInstance(MemberPayoutResponseDto, rows),
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
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
          commissionAmount: transactionUpdate.amount,
          quotaDeducted: transactionUpdate.after - transactionUpdate.before,
          withHeldAmount:
            (orderDetails.amount / 100) * orderDetails.member?.withdrawalRate ||
            0,
          withHeldRate: orderDetails.member?.withdrawalRate || 0,
        },
      };

      return plainToInstance(MemberPayoutDetailsResponseDto, res);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
