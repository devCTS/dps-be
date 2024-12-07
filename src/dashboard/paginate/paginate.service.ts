import { Injectable } from '@nestjs/common';
import { PaginateUserDto } from './dto/paginate-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Identity } from 'src/users/identity/entities/identity.entity';
import { Admin } from 'src/users/admin/entities/admin.entity';
import { Repository } from 'typeorm';
import {
  getUserResponseDto,
  getUserTable,
  parseEndDate,
  parseStartDate,
} from './paginate.util';
import { plainToInstance } from 'class-transformer';
import { AdminDetailsDto } from 'src/users/admin/dto/response/admin-details.dto';
import { Users } from 'src/utils/enums/users';

@Injectable()
export class PaginateService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async paginateUser(userType: Users, paginateDto: PaginateUserDto) {
    const userTable = getUserTable(userType);
    const userResponseDto = getUserResponseDto(userType);
    const search = paginateDto.search;
    const pageSize = paginateDto.pageSize;
    const pageNumber = paginateDto.pageNumber;
    const sortBy = paginateDto.sortBy;

    const query = this.adminRepository.createQueryBuilder(userTable);
    query.leftJoinAndSelect(`${userTable}.identity`, 'identity');

    if (search) {
      query.andWhere(
        `CONCAT(identity.first_name, ' ', identity.last_name) ILIKE :search`,
        { search: `%${search}%` },
      );
    }

    if (paginateDto.startDate && paginateDto.endDate) {
      const startDate = parseStartDate(paginateDto.startDate);
      const endDate = parseEndDate(paginateDto.endDate);

      query.andWhere('identity.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // if (paginateDto.userId) {
    //   query.andWhere('admin.id != :userId', { userId: paginateDto.userId });
    // }

    if (sortBy)
      sortBy === 'LATEST'
        ? query.orderBy('identity.createdAt', 'DESC')
        : query.orderBy('identity.createdAt', 'ASC');

    const skip = (pageNumber - 1) * pageSize;
    query.skip(skip).take(pageSize);

    // Execute query
    const [rows, total] = await query.getManyAndCount();
    const dtos = plainToInstance(userResponseDto, rows);

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
