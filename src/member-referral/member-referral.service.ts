import { Injectable } from '@nestjs/common';
import { CreateMemberReferralDto } from './dto/create-member-referral.dto';
import { UpdateMemberReferralDto } from './dto/update-member-referral.dto';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberReferral } from './entities/member-referral.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MemberReferralService {
  constructor(
    @InjectRepository(MemberReferral)
    private readonly memberReferralRepository: Repository<MemberReferral>,
  ) {}

  create(createMemberReferralDto: CreateMemberReferralDto) {
    return 'This action adds a new memberReferral';
  }

  findAll() {
    return `This action returns all memberReferral`;
  }

  findOne(id: number) {
    return `This action returns a #${id} memberReferral`;
  }

  update(id: number, updateMemberReferralDto: UpdateMemberReferralDto) {
    return `This action updates a #${id} memberReferral`;
  }

  remove(id: number) {
    return `This action removes a #${id} memberReferral`;
  }

  async paginate(paginateDto: PaginateRequestDto) {
    const query =
      this.memberReferralRepository.createQueryBuilder('memberReferral');

    query.leftJoinAndSelect('memberReferral.member', 'member');

    const search = paginateDto.search;
    const pageSize = paginateDto.pageSize;
    const pageNumber = paginateDto.pageNumber;

    if (search) {
      query.andWhere(`CONCAT(memberReferral.referral_code) ILIKE :search`, {
        search: `%${search}%`,
      });
    }

    if (paginateDto.startDate && paginateDto.endDate) {
      const startDate = parseStartDate(paginateDto.startDate);
      const endDate = parseEndDate(paginateDto.endDate);

      query.andWhere(
        'memberReferral.created_at BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    }

    const skip = (pageNumber - 1) * pageSize;
    query.skip(skip).take(pageSize);

    const [rows, total] = await query.getManyAndCount();

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    return {
      data: rows,
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
    };
  }
}
