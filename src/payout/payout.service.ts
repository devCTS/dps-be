import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { Repository } from 'typeorm';
import { payouts } from './data';

@Injectable()
export class PayoutService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
  ) {}

  async create(createPayoutDto: CreatePayoutDto) {
    const payout = await this.payoutRepository.save({ ...createPayoutDto });
    return HttpStatus.CREATED;
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

  async paginate(paginateRequestDto: PaginateRequestDto) {
    const { search, pageSize, pageNumber, startDate, endDate, userId } =
      paginateRequestDto;

    const whereConditions: any = {};

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    // if (userId) whereConditions.member = { id: userId };

    const [rows, total] = await this.payoutRepository.findAndCount({
      // where: whereConditions,
      relations: [],
      skip,
      take,
    });

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    return {
      data: payouts,
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
    };
  }
}
