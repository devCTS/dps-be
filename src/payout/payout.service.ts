import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { Repository } from 'typeorm';
import { payouts } from './data';
import { plainToInstance } from 'class-transformer';
import { AdminPayoutResponseDto } from './dto/paginate-response/admin-payout-response.dto';
import { MerchantPayoutResponseDto } from './dto/paginate-response/merchant-payout-response.dto';
import { MemberPayoutResponseDto } from './dto/paginate-response/member-payout-response.dto';
import { AdminPayoutDetailsResponseDto } from './dto/payout-details-response/admin-payout-details-response.dto';
import { MemberPayoutDetailsResponseDto } from './dto/payout-details-response/member-payout-details-response.dto';
import { MerchantPayoutDetailsResponseDto } from './dto/payout-details-response/merchant-payout-details-response.dto';

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

  async paginate(
    paginateRequestDto: PaginateRequestDto,
    role: string,
    showPending = false,
  ) {
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

    let dataToSend = {};

    switch (role) {
      case 'admin':
        dataToSend = plainToInstance(AdminPayoutResponseDto, payouts);
        break;

      case 'merchant':
        dataToSend = plainToInstance(MerchantPayoutResponseDto, payouts);
        break;

      case 'member':
        dataToSend = plainToInstance(MemberPayoutResponseDto, payouts);
        break;

      default:
        break;
    }

    return {
      data: dataToSend,
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
    };
  }

  async getPayoutDetails(id: number, role: string) {
    const payout = await this.payoutRepository.findOne({
      where: { id },
      relations: [],
    });

    if (!payout) throw new NotFoundException('Order not found!');

    let dataToSend = {};

    switch (role) {
      case 'admin':
        plainToInstance(AdminPayoutDetailsResponseDto, payout);
        break;

      case 'member':
        plainToInstance(MemberPayoutDetailsResponseDto, payout);
        break;

      case 'merchant':
        plainToInstance(MerchantPayoutDetailsResponseDto, payout);
        break;

      default:
        break;
    }

    return dataToSend;
  }
}
