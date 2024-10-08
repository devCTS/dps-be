import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { Payin } from './entities/payin.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { PayinResponseDto } from './dto/payin-response.dto';
import { adminPayins } from './data/dummy-data';
import { SortedBy } from 'src/utils/enum/enum';

@Injectable()
export class PayinService {
  constructor(
    @InjectRepository(Payin)
    private payinRepository: Repository<Payin>,
  ) {}
  async paginatePayins(paginateRequestDto: PaginateRequestDto) {
    const query = this.payinRepository.createQueryBuilder('payin');

    const search = paginateRequestDto.search;
    const pageSize = paginateRequestDto.pageSize;
    const pageNumber = paginateRequestDto.pageNumber;
    const sortedBy = paginateRequestDto.sortedBy;

    if (search) {
      query.andWhere(
        `CONCAT(merchant.first_name, ' ', merchant.last_name) ILIKE :search`,
        { search: `%${search}%` },
      );
    }

    // Handle filtering by created_at between startDate and endDate
    if (paginateRequestDto.startDate && paginateRequestDto.endDate) {
      const startDate = parseStartDate(paginateRequestDto.startDate);
      const endDate = parseEndDate(paginateRequestDto.endDate);

      query.andWhere('member.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Sorting
    if (sortedBy) {
      switch (sortedBy) {
        case SortedBy.LATEST:
          query.orderBy('payin.createdDate', 'DESC');
          break;
        case SortedBy.OLDEST:
          query.orderBy('payin.createdDate', 'ASC');
          break;
        default:
          break;
      }
    }

    // Handle pagination
    const skip = (pageNumber - 1) * pageSize;
    query.skip(skip).take(pageSize);

    // Execute query
    const [rows, total] = await query.getManyAndCount();

    // Adding data from dummy file. Will be changed later
    // let data = Object.assign({}, rows, adminPayins[0]);

    const dtos = plainToInstance(PayinResponseDto, adminPayins);

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    return {
      data: dtos,
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
    };
  }
}
