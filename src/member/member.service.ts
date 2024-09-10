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
import { ChannelProfileFilledField } from 'src/channel/entities/channelProfileFilledField.entity';
import { ChannelProfileField } from 'src/channel/entities/channelProfileField.entity';
import { Channel } from 'src/channel/entities/channel.entity';
import { ChannelService } from 'src/channel/channel.service';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly identityService: IdentityService,
    private readonly channelService: ChannelService,
  ) {}

  async create(createMemberDto: CreateMemberDto) {
    const {
      email,
      password,
      dailyTotalPayoutLimit,
      enabled,
      firstName,
      lastName,
      payinCommissionRate,
      payoutCommissionRate,
      singlePayoutLowerLimit,
      singlePayoutUpperLimit,
      topupCommissionRate,
      phone,
      referralCode,
      channelProfile,
    } = createMemberDto;
    const identity = await this.identityService.create(
      email,
      password,
      'MEMBER',
    );

    // Create and save the Admin
    const member = this.memberRepository.create({
      identity,
      firstName,
      lastName,
      referralCode,
      phone,
      enabled,
      dailyTotalPayoutLimit,
      payinCommissionRate,
      payoutCommissionRate,
      singlePayoutLowerLimit,
      singlePayoutUpperLimit,
      topupCommissionRate,
    });

    const createdMember = await this.memberRepository.save(member);

    // Process the channels and their profile fields
    await this.channelService.processChannelFilledFields(
      createMemberDto.channelProfile,
      createdMember.identity,
    );

    return HttpStatus.OK;
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
        firstName: verifiedContext.firstName,
        lastName: verifiedContext.lastName,
        referralCode: registerDto.referralCode,
        phone: '',
        enabled: true,
        dailyTotalPayoutLimit: 10000000,
        payinCommissionRate: 3,
        payoutCommissionRate: 1,
        singlePayoutLowerLimit: 10,
        singlePayoutUpperLimit: 1000000,
        topupCommissionRate: 4,
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
      relations: [
        'identity',
        'identity.channelProfileFilledFields',
        'identity.channelProfileFilledFields.field',
        'identity.channelProfileFilledFields.field.channel',
      ],
    });

    return plainToInstance(MemberResponseDto, results);
  }

  async findOne(id: number): Promise<any> {
    const results = await this.memberRepository.findOne({
      where: { id },
      relations: [
        'identity',
        'identity.channelProfileFilledFields',
        'identity.channelProfileFilledFields.field',
        'identity.channelProfileFilledFields.field.channel',
      ],
    });

    return plainToInstance(MemberResponseDto, results);
  }

  async update(id: number, updateDto: UpdateMemberDto): Promise<HttpStatus> {
    const channelProfile = updateDto.channelProfile;
    delete updateDto.channelProfile;
    delete updateDto.email;
    delete updateDto.password;
    const result = await this.memberRepository.update({ id: id }, updateDto);

    const member = await this.memberRepository.findOne({
      where: { id: id },
      relations: ['identity'],
    });

    await this.channelService.processChannelFilledFields(
      channelProfile,
      member.identity,
    );

    return HttpStatus.OK;
  }

  async remove(id: number) {
    const admin = await this.memberRepository.findOne({
      where: { id: id },
      relations: ['identity'], // Ensure you load the identity relation
    });

    if (!admin) throw new NotFoundException();

    this.channelService.deleteChannelProfileOfUser(admin.identity);
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
