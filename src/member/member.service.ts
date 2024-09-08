import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { RegisterDto } from './dto/register.dto';
import { IdentityService } from 'src/identity/identity.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { MemberResponseDto } from './dto/member-response.dto';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly identityService: IdentityService,
  ) {}

  async create(createMemberDto: CreateMemberDto) {
    const { email, password } = createMemberDto;
    const identity = await this.identityService.create(
      email,
      password,
      'MEMBER',
    );

    // Create and save the Admin
    const member = this.memberRepository.create({
      identity,
      first_name: createMemberDto.firstName,
      last_name: createMemberDto.lastName,
      referral_code: createMemberDto.referralCode,
      phone: createMemberDto.phone,
      enabled: createMemberDto.enabled,
      daily_total_payout_limit: createMemberDto.dailyTotalPayoutLimit,
      payin_commission_rate: createMemberDto.payinCommissionRate,
      payout_commission_rate: createMemberDto.payoutCommissionRate,
      single_payout_lower_limit: createMemberDto.singlePayoutLowerLimit,
      single_payout_upper_limit: createMemberDto.singlePayoutUpperLimit,
      topup_commission_rate: createMemberDto.topupCommissionRate,
    });

    const createdMember = await this.memberRepository.save(member);

    return plainToInstance(MemberResponseDto, createdMember);
  }

  async registerViaSignup(registerDto: RegisterDto) {
    const verifiedContext =
      await this.identityService.isMemberVerifedForRegister(registerDto.email);

    if (verifiedContext) {
      const identity = await this.identityService.create(
        registerDto.email,
        registerDto.password,
        'MEMBER',
      );

      const member = this.memberRepository.create({
        identity,
        first_name: verifiedContext.firstName,
        last_name: verifiedContext.lastName,
        referral_code: registerDto.referralCode,
        phone: '',
        enabled: true,
        daily_total_payout_limit: 10000000,
        payin_commission_rate: 3,
        payout_commission_rate: 1,
        single_payout_lower_limit: 10,
        single_payout_upper_limit: 1000000,
        topup_commission_rate: 4,
      });
      const createdMember = await this.memberRepository.save(member);

      return {
        token: await this.identityService.signin({
          email: registerDto.email,
          password: registerDto.password,
        }),
        data: plainToInstance(MemberResponseDto, createdMember),
      };
    } else throw new NotFoundException('Request context not found');
  }

  async findAll(): Promise<MemberResponseDto[]> {
    const results = await this.memberRepository.find({
      relations: ['identity'],
    });

    return plainToInstance(MemberResponseDto, results);
  }

  async findOne(id: number): Promise<MemberResponseDto> {
    const results = await this.memberRepository.findOne({
      where: { id: id },
      relations: ['identity'],
    });

    return plainToInstance(MemberResponseDto, results);
  }

  async update(id: number, updateDto: any): Promise<HttpStatus> {
    const result = await this.memberRepository.update({ id: id }, updateDto);

    return HttpStatus.OK;
  }

  async remove(id: number) {
    const admin = await this.memberRepository.findOne({
      where: { id: id },
      relations: ['identity'], // Ensure you load the identity relation
    });

    if (!admin) throw new NotFoundException();

    this.memberRepository.delete(id);
    this.identityService.remove(admin.identity?.id);

    return HttpStatus.OK;
  }

  async paginate(paginateDto: PaginateRequestDto) {
    const query = this.memberRepository.createQueryBuilder('member');

    const search = paginateDto.search;
    const pageSize = paginateDto.pageSize;
    const pageNumber = paginateDto.pageNumber;
    // Handle search by first_name + " " + last_name
    if (search) {
      query.andWhere(
        `CONCAT(member.first_name, ' ', member.last_name) ILIKE :search`,
        { search: `%${search}%` },
      );
    }

    // Handle filtering by created_at between startDate and endDate
    if (paginateDto.startDate && paginateDto.endDate) {
      const startDate = parseStartDate(paginateDto.startDate);
      const endDate = parseEndDate(paginateDto.endDate);

      query.andWhere('member.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Handle pagination
    const skip = (pageNumber - 1) * pageSize;
    query.skip(skip).take(pageSize);

    // Execute query
    const [admins, total] = await query.getManyAndCount();

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    // Return paginated result
    return {
      data: admins,
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
    };
  }
}
