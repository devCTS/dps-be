import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { Repository } from 'typeorm';
import * as uniqid from 'uniqid';
import { WithdrawalOrderStatus } from 'src/utils/enum/enum';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
  ) {}

  async create(createWithdrawalDto: CreateWithdrawalDto) {
    const { channel, channelDetails, withdrawalAmount } = createWithdrawalDto;

    const createWithdrawalOrder = await this.withdrawalRepository.save({
      channel,
      channelDetails,
      amount: withdrawalAmount,
      systemOrderId: uniqid(),
    });
    if (!createWithdrawalOrder)
      throw new InternalServerErrorException('Failed to create order!');

    return HttpStatus.CREATED;
  }

  async updateStatusToComplete(body) {
    const { id } = body;

    const orderDetails = await this.withdrawalRepository.findOneBy({
      systemOrderId: id,
    });
    if (!orderDetails) throw new NotFoundException('Order not found!');

    await this.withdrawalRepository.update(orderDetails.id, {
      status: WithdrawalOrderStatus.COMPLETE,
    });

    return HttpStatus.OK;
  }

  async updateStatusToRejected(body) {
    const { id } = body;

    const orderDetails = await this.withdrawalRepository.findOneBy({
      systemOrderId: id,
    });
    if (!orderDetails) throw new NotFoundException('Order not found!');

    await this.withdrawalRepository.update(orderDetails.id, {
      status: WithdrawalOrderStatus.REJECTED,
    });

    return HttpStatus.OK;
  }

  async updateStatusToFailed(body) {
    const { id } = body;

    const orderDetails = await this.withdrawalRepository.findOneBy({
      systemOrderId: id,
    });
    if (!orderDetails) throw new NotFoundException('Order not found!');

    await this.withdrawalRepository.update(orderDetails.id, {
      status: WithdrawalOrderStatus.FAILED,
    });

    return HttpStatus.OK;
  }
}
