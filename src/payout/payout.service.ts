import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { Repository } from 'typeorm';
import { TransactionUpdatesService } from 'src/transaction-updates/transaction-updates-payin.service';
import { OrderStatus, OrderType, PaymentMadeOn } from 'src/utils/enum/enum';
import { EndUserService } from 'src/end-user/end-user.service';
import { Merchant } from 'src/merchant/entities/merchant.entity';

@Injectable()
export class PayoutService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(Payout)
    private readonly merchantRepository: Repository<Merchant>,
    private readonly transactionUpdateService: TransactionUpdatesService,
    private readonly endUserService: EndUserService,
  ) {}

  async create(payoutDetails) {
    const { user, merchantId } = payoutDetails;

    const endUser = await this.endUserService.create({
      ...user,
    });

    const merchant = await this.merchantRepository.findOneBy({
      id: merchantId,
    });

    const payout = await this.payoutRepository.save({
      ...payoutDetails,
      user: endUser,
      merchant,
    });

    if (payout)
      await this.transactionUpdateService.create({
        orderDetails: payout,
        orderType: OrderType.PAYOUT,
        userId: merchantId,
        systemOrderId: payout.systemOrderId,
      });

    return HttpStatus.CREATED;
  }

  async updatePayoutStatusToAssigned(body) {
    const { id, paymentMode, memberId } = body;

    const payoutOrderDetails = await this.payoutRepository.findOne({
      where: { id },
      relations: ['merchant'],
    });

    if (!payoutOrderDetails) throw new NotFoundException('Order not found');

    await this.payoutRepository.update(id, {
      status: OrderStatus.ASSIGNED,
      payoutMadeVia: paymentMode,
    });

    if (payoutOrderDetails.payoutMadeVia === PaymentMadeOn.MEMBER)
      await this.transactionUpdateService.create({
        orderDetails: payoutOrderDetails,
        userId: memberId,
        forMember: true,
        orderType: OrderType.PAYOUT,
        systemOrderId: payoutOrderDetails.systemOrderId,
      });

    return HttpStatus.OK;
  }

  async updatePayoutStatusToComplete(body) {
    const { id } = body;
    const payinOrderDetails = await this.payoutRepository.findOneBy({ id });

    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    await this.payoutRepository.update(id, { status: OrderStatus.COMPLETE });

    return HttpStatus.OK;
  }

  async updatePayoutStatusToFailed(body) {
    const { id } = body;

    const payinOrderDetails = await this.payoutRepository.findOneBy({ id });

    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    await this.payoutRepository.update(id, { status: OrderStatus.FAILED });

    return HttpStatus.OK;
  }

  async updatePayoutStatusToSubmitted(body) {
    const { id } = body;

    const payinOrderDetails = await this.payoutRepository.findOneBy({ id });

    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    await this.payoutRepository.update(id, { status: OrderStatus.SUBMITTED });

    return HttpStatus.OK;
  }

  findAll() {
    return `This action returns all payout`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payout`;
  }

  update(id: number, updatePayoutDto: UpdatePayoutDto) {
    return `This action updates a #${id} payout`;
  }

  remove(id: number) {
    return `This action removes a #${id} payout`;
  }
}
