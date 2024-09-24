import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMemberReferralDto } from './dto/create-member-referral.dto';
import { UpdateMemberReferralDto } from './dto/update-member-referral.dto';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberReferral } from './entities/member-referral.entity';
import { Between, ILike, Repository } from 'typeorm';
import { Member } from 'src/member/entities/member.entity';

@Injectable()
export class MemberReferralService {
  constructor(
    @InjectRepository(MemberReferral)
    private readonly memberReferralRepository: Repository<MemberReferral>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async create(createMemberReferralDto: CreateMemberReferralDto) {
    const {
      referralCode,
      memberId,
      payinCommission,
      payoutCommission,
      topupCommission,
      referredMemberPayinCommission,
      referredMemberPayoutCommission,
      referredMemberTopupCommission,
    } = createMemberReferralDto;

    const member = await this.memberRepository.findOneBy({ id: memberId });
    if (!member) throw new NotFoundException('Member not found!');

    await this.memberReferralRepository.save({
      referralCode,
      memberId,
      payinCommission,
      payoutCommission,
      topupCommission,
      referredMemberPayinCommission,
      referredMemberPayoutCommission,
      referredMemberTopupCommission,
    });

    return HttpStatus.OK;
  }

  async findAll() {
    const results = await this.memberReferralRepository.find({
      relations: ['member', 'referredMember'],
    });

    return {
      status: HttpStatus.FOUND,
      length: results.length,
      data: results,
    };
  }

  async findOne(id: number) {
    const memberReferral = await this.memberReferralRepository.findOne({
      where: { id },
      relations: ['member', 'referredMember'],
    });

    return {
      status: HttpStatus.FOUND,
      data: memberReferral,
    };
  }

  async update(id: number, updateMemberReferralDto: UpdateMemberReferralDto) {
    const memberReferral = await this.memberReferralRepository.findOneBy({
      id,
    });
    if (!memberReferral) throw new NotFoundException();

    await this.memberReferralRepository.update(id, updateMemberReferralDto);

    return HttpStatus.OK;
  }

  async remove(id: number) {
    const memberReferral = await this.memberReferralRepository.findOne({
      where: {
        id,
      },
      relations: ['member', 'referredMember'],
    });
    if (!memberReferral) throw new NotFoundException('Entity not found!');

    await this.memberReferralRepository.remove(memberReferral);

    return HttpStatus.OK;
  }

  async removeAll() {
    const memberReferrals = await this.memberReferralRepository.find({
      relations: ['member', 'referredMember'],
    });

    await this.memberReferralRepository.remove(memberReferrals);

    return HttpStatus.OK;
  }

  async paginate(paginateDto: PaginateRequestDto) {
    const { search, pageSize, pageNumber, startDate, endDate } = paginateDto;

    const whereConditions: any = {};

    if (search) whereConditions.referralCode = ILike(`%${search}%`);

    if (startDate && endDate) {
      const parsedStartDate = parseStartDate(startDate);
      const parsedEndDate = parseEndDate(endDate);
      whereConditions.createdAt = Between(parsedStartDate, parsedEndDate);
    }

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const [rows, total] = await this.memberReferralRepository.findAndCount({
      where: whereConditions,
      relations: ['member', 'referredMember', 'member.identity'],
      skip,
      take,
    });

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
