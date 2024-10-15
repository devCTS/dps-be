import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { Repository } from 'typeorm';
import { TransactionUpdatesService } from 'src/transaction-updates/transaction-updates.service';
import { OrderStatus } from 'src/utils/enum/enum';

@Injectable()
export class PayoutService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    private readonly transactionUpdateService: TransactionUpdatesService,
  ) {}

  async create(createPayoutDto: CreatePayoutDto) {
    const payout = await this.payoutRepository.save({ ...createPayoutDto });
    if (payout) await this.transactionUpdateService.create(payout);
    return HttpStatus.CREATED;
  }

  async updatePayoutStatusToAssigned(id: number) {
    const payinOrderDetails = await this.payoutRepository.findOneBy({ id });

    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    await this.payoutRepository.update(id, { status: OrderStatus.ASSIGNED });

    await this.transactionUpdateService.create(payinOrderDetails);

    return HttpStatus.OK;
  }

  async updatePayoutStatusToCompleted(id: number) {
    const payinOrderDetails = await this.payoutRepository.findOneBy({ id });

    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    await this.payoutRepository.update(id, { status: OrderStatus.COMPLETE });

    return HttpStatus.OK;
  }

  async updatePayoutStatusToFailed(id: number) {
    const payinOrderDetails = await this.payoutRepository.findOneBy({ id });

    if (!payinOrderDetails) throw new NotFoundException('Order not found');

    await this.payoutRepository.update(id, { status: OrderStatus.FAILED });

    return HttpStatus.OK;
  }

  async updatePayoutStatusToSubmitted(id: number) {
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
