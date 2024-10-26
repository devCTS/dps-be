import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payout } from './entities/payout.entity';
import { plainToInstance } from 'class-transformer';
import { MerchantPayoutDetailsResponseDto } from './dto/payout-details-response/merchant-payout-details-response.dto';
import { MerchantPayoutResponseDto } from './dto/paginate-response/merchant-payout-response.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';

@Injectable()
export class PayoutMerchantService {
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
      data: plainToInstance(MerchantPayoutResponseDto, rows),
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
        relations: ['user', 'merchant', 'member'],
      });
      if (!orderDetails) throw new NotFoundException('Order not found.');

      const transactionUpdateMerchant =
        await this.transactionUpdateRepository.findOne({
          where: {
            systemOrderId: id,
            userType: UserTypeForTransactionUpdates.MERCHANT_BALANCE,
            user: { id: orderDetails.merchant?.identity?.id },
          },
          relations: ['payinOrder', 'user', 'user.merchant'],
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
        balanceDetails: {
          serviceRate: transactionUpdateMerchant.rate,
          serviceFee: transactionUpdateMerchant.amount,
          balanceDeducted:
            transactionUpdateMerchant.before - transactionUpdateMerchant.after,
        },
      };

      const details = plainToInstance(MerchantPayoutDetailsResponseDto, res);

      return details;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
