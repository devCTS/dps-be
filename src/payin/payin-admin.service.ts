import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { Payin } from './entities/payin.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import {
  PayinAdminResponseDto,
  PayinDetailsAdminResDto,
} from './dto/payin-admin-response.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { adminPayins } from './data/dummy-data';

@Injectable()
export class PayinAdminService {
  constructor(
    @InjectRepository(Payin)
    private payinRepository: Repository<Payin>,
    @InjectRepository(TransactionUpdate)
    private transactionUpdateRepository: Repository<TransactionUpdate>,
  ) {}

  async paginatePayins(paginateRequestDto: PaginateRequestDto) {
    const { search, pageSize, pageNumber, startDate, endDate, userId } =
      paginateRequestDto;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const [rows, total] = await this.payinRepository.findAndCount({
      relations: ['merchant', 'user'],
      skip,
      take,
    });

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    const dtos = plainToInstance(PayinAdminResponseDto, [
      // ...rows,
      ...adminPayins,
    ]);

    return {
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
      data: dtos,
    };
  }

  async getPayinDetails(id: number) {
    const payin = await this.payinRepository.findOne({
      where: { id },
      relations: ['user', 'merchant'],
    });
    if (!payin) throw new NotFoundException('Order not found!');

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          payinOrder: { id },
        },
        relations: ['payinOrder', 'user'],
      });

    const response = {
      ...payin,
      transactionDetails: {
        transactionId: '848484575775784',
        receipt:
          'https://unsplash.com/photos/black-flat-screen-computer-monitor-cFFEeHNZEqw',
        member: {
          'Upi Id': '9149965887@2912',
          'Mobile Number': '9149965887',
        },
        gateway: null,
      },
      balancesAndProfit: transactionUpdateEntries,
    };

    return plainToInstance(PayinDetailsAdminResDto, response);
  }
}
