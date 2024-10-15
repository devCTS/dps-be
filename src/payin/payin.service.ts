import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payin } from './entities/payin.entity';
import { OrderStatus, OrderType, PaymentMadeOn } from 'src/utils/enum/enum';
import { TransactionUpdatesService } from 'src/transaction-updates/transaction-updates.service';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { EndUserService } from 'src/end-user/end-user.service';

@Injectable()
export class PayinService {
  constructor(
    @InjectRepository(Payin)
    private readonly payinRepository: Repository<Payin>,
    private readonly transactionUpdateService: TransactionUpdatesService,
    private readonly endUserService: EndUserService,
  ) {}

  async create(payinDetails) {
    const { user } = payinDetails;

    const endUser = await this.endUserService.create({
      ...user,
    });

    const payin = await this.payinRepository.save({
      ...payinDetails,
      user: endUser,
    });
    if (payin) {
      await this.transactionUpdateService.create({
        orderDetails: payin,
        orderType: OrderType.PAYIN,
      });
    }

    return HttpStatus.CREATED;
  }

  async updatePayinStatusToAssigned(id: number) {
    const payinOrderDetails = await this.payinRepository.findOneBy({ id });

    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    await this.payinRepository.update(id, { status: OrderStatus.ASSIGNED });

    if (payinOrderDetails.payinMadeOn === PaymentMadeOn.MEMBER) {
      // await this.transactionUpdateService.create(payinOrderDetails);
    }

    return HttpStatus.OK;
  }

  async updatePayinStatusToComplete(id: number) {
    const payinOrderDetails = await this.payinRepository.findOneBy({ id });

    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    await this.payinRepository.update(id, { status: OrderStatus.COMPLETE });

    return HttpStatus.OK;
  }

  async updatePayinStatusToFailed(id: number) {
    const payinOrderDetails = await this.payinRepository.findOneBy({ id });

    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    await this.payinRepository.update(id, { status: OrderStatus.FAILED });

    return HttpStatus.OK;
  }

  async updatePayinStatusToSubmitted(id: number) {
    const payinOrderDetails = await this.payinRepository.findOneBy({ id });

    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    await this.payinRepository.update(id, { status: OrderStatus.SUBMITTED });

    return HttpStatus.OK;
  }

  findAll() {
    return `This action returns all payout`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payout`;
  }

  remove(id: number) {
    return `This action removes a #${id} payout`;
  }
}
