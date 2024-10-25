import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { Repository } from 'typeorm';

import { OrderStatus, OrderType, PaymentMadeOn } from 'src/utils/enum/enum';
import { EndUserService } from 'src/end-user/end-user.service';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import * as uniqid from 'uniqid';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { TransactionUpdatesPayoutService } from 'src/transaction-updates/transaction-updates-payout.service';

@Injectable()
export class PayoutService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(EndUser)
    private readonly endUserRepository: Repository<EndUser>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    private readonly transactionUpdatePayoutService: TransactionUpdatesPayoutService,
    private readonly endUserService: EndUserService,
  ) {}

  async create(payoutDetails: CreatePayoutDto) {
    const { name, email, merchantId, channelDetails, channel, mobile } =
      payoutDetails;

    let endUserData = await this.endUserRepository.findOneBy({ email });

    if (!endUserData) {
      endUserData = await this.endUserService.create({
        email,
        channelDetails,
        channel,
        mobile,
        name,
        userId: uniqid(),
      });
    }

    const merchant = await this.merchantRepository.findOneBy({
      id: merchantId,
    });

    const payout = await this.payoutRepository.save({
      ...payoutDetails,
      user: endUserData,
      merchant,
      systemOrderId: uniqid(),
    });

    if (!payout) throw new InternalServerErrorException('Payout error');

    if (payout)
      await this.transactionUpdatePayoutService.create({
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
      await this.transactionUpdatePayoutService.create({
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
