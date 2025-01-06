import {
  HttpCode,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EndUser } from './entities/end-user.entity';
import { Repository } from 'typeorm';
import { CreateEndUserDto } from './dto/create-end-user.dto';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { plainToInstance } from 'class-transformer';
import { EndUserPaginateResponseDto } from './dto/paginate-response.dto';

@Injectable()
export class EndUserService {
  constructor(
    @InjectRepository(EndUser)
    private readonly endUserRepository: Repository<EndUser>,
  ) {}

  async create(createEndUserDto: CreateEndUserDto) {
    const { channelDetails } = createEndUserDto;

    const channelDetailsJson = JSON.stringify(channelDetails);

    const endUser = await this.endUserRepository.save({
      channelDetails: channelDetailsJson,
      ...createEndUserDto,
    });

    return endUser;
  }

  async findOne(id) {
    const endUser = await this.endUserRepository.findOne({
      where: { id },
      relations: [],
    });

    if (!endUser) throw new NotFoundException('End user not found!');

    endUser.channelDetails = JSON.parse(endUser.channelDetails);

    return endUser;
  }

  async findAll() {
    const endUsers = await this.endUserRepository.find({
      relations: [],
    });

    endUsers.forEach((endUser) => {
      endUser.channelDetails = JSON.parse(endUser.channelDetails);
    });

    return endUsers;
  }

  async paginate(paginateDto: PaginateRequestDto) {
    const query = this.endUserRepository.createQueryBuilder('endUser');
    query.leftJoinAndSelect('endUser.merchant', 'merchant');

    const search = paginateDto.search;
    const pageSize = paginateDto.pageSize;
    const pageNumber = paginateDto.pageNumber;
    const sortBy = paginateDto.sortBy;

    if (search) {
      query.andWhere(
        `(
        CONCAT("merchant"."first_name", ' ', "merchant"."last_name", ' ', "endUser"."name", ' ', "endUser"."mobile") ILIKE :search
        OR
        "endUser"."channel_details"::jsonb -> 'UPI' ->> 'Upi Id' ILIKE :search
      )`,
        { search: `%${search}%` },
      );
    }

    if (paginateDto.startDate && paginateDto.endDate) {
      const startDate = parseStartDate(paginateDto.startDate);
      const endDate = parseEndDate(paginateDto.endDate);

      query.andWhere('endUser.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (sortBy)
      sortBy === 'latest'
        ? query.orderBy('endUser.createdAt', 'DESC')
        : query.orderBy('endUser.createdAt', 'ASC');

    const skip = (pageNumber - 1) * pageSize;
    query.skip(skip).take(pageSize);

    const [rows, total] = await query.getManyAndCount();

    const dtos = plainToInstance(EndUserPaginateResponseDto, rows);

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

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

  async toggleBlacklisted(id: number) {
    const user = await this.endUserRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found!');

    await this.endUserRepository.update(user.id, {
      isBlacklisted: !user.isBlacklisted,
    });

    return HttpStatus.OK;
  }

  async getEndUserDetails(id: string) {
    const endUser = await this.endUserRepository.findOne({
      where: { userId: id },
    });
    if (!endUser) throw new NotFoundException('End user not found!');

    return {
      userName: endUser.name,
      userId: endUser.userId,
      userEmail: endUser.email,
      userMobile: endUser.mobile,
    };
  }
}
