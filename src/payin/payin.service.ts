import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payin } from './entities/payin.entity';
import { OrderStatus, OrderType, PaymentMadeOn } from 'src/utils/enum/enum';
import { TransactionUpdatesService } from 'src/transaction-updates/transaction-updates.service';
import { EndUserService } from 'src/end-user/end-user.service';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';

@Injectable()
export class PayinService {
  constructor(
    @InjectRepository(Payin)
    private readonly payinRepository: Repository<Payin>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    private readonly transactionUpdateService: TransactionUpdatesService,
    private readonly endUserService: EndUserService,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async create(payinDetails) {
    const { user, merchantId } = payinDetails;

    const endUser = await this.endUserService.create({
      ...user,
    });

    const merchant = await this.merchantRepository.findOneBy({
      id: merchantId,
    });

    const systemConfig = await this.systemConfigService.findLatest(false);

    const merchantCharge =
      (payinDetails.amount / 100) * merchant.payinServiceRate;

    const systemProfit = merchantCharge + systemConfig.systemProfit;

    const payin = await this.payinRepository.save({
      ...payinDetails,
      user: endUser,
      merchantCharge,
      systemProfit,
      merchant,
    });

    if (payin)
      await this.transactionUpdateService.create({
        orderDetails: payin,
        orderType: OrderType.PAYIN,
        userId: merchantId,
      });

    return HttpStatus.CREATED;
  }

  async updatePayinStatusToAssigned(body) {
    const { id, payinMode, memberId } = body;

    const payinOrderDetails = await this.payinRepository.findOne({
      where: { id },
      relations: ['merchant'],
    });

    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    await this.payinRepository.update(id, {
      status: OrderStatus.ASSIGNED,
      payinMadeOn: payinMode,
    });

    if (payinOrderDetails.payinMadeOn === PaymentMadeOn.MEMBER)
      await this.transactionUpdateService.create({
        orderDetails: payinOrderDetails,
        userId: memberId,
        forMember: true,
        orderType: OrderType.PAYIN,
      });

    return HttpStatus.OK;
  }

  async updatePayinStatusToComplete(body) {
    const { id } = body;
    const payinOrderDetails = await this.payinRepository.findOneBy({ id });

    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    await this.payinRepository.update(id, { status: OrderStatus.COMPLETE });

    return HttpStatus.OK;
  }

  async updatePayinStatusToFailed(body) {
    const { id } = body;
    const payinOrderDetails = await this.payinRepository.findOneBy({ id });

    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    await this.payinRepository.update(id, { status: OrderStatus.FAILED });

    return HttpStatus.OK;
  }

  async updatePayinStatusToSubmitted(body) {
    const { id } = body;
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
