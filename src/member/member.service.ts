import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { RegisterDto } from './dto/register.dto';
import { IdentityService } from 'src/identity/identity.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { Repository, Between } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { MemberResponseDto } from './dto/member-response.dto';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { JwtService } from 'src/services/jwt/jwt.service';
import { ChangePasswordDto } from 'src/identity/dto/changePassword.dto';
import { MemberReferralService } from 'src/member-referral/member-referral.service';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly identityService: IdentityService,
    private readonly jwtService: JwtService,
    private readonly memberReferralService: MemberReferralService,
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
      minWithdrawalAmount,
      maxWithdrawalAmount,
      withdrawalRate,
      telegramId,
    } = createMemberDto;

    if (referralCode) {
      const isCodeValid =
        await this.memberReferralService.validateReferralCode(referralCode);

      if (!isCodeValid) return;
    }

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
      telegramId,
      minWithdrawalAmount,
      maxWithdrawalAmount,
      withdrawalRate,
    });

    const createdMember = await this.memberRepository.save(member);

    // Update Member Referrals
    if (referralCode)
      await this.memberReferralService.updateFromReferralCode({
        referralCode,
        referredMemberPayinCommission: payinCommissionRate,
        referredMemberPayoutCommission: payoutCommissionRate,
        referredMemberTopupCommission: topupCommissionRate,
        referredMember: createdMember,
      });

    return HttpStatus.OK;
  }

  async registerViaSignup(registerDto: RegisterDto) {
    const { referralCode } = registerDto;

    if (referralCode) {
      const isCodeValid =
        await this.memberReferralService.validateReferralCode(referralCode);

      if (!isCodeValid) return;
    }

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

      // Update Member Referrals
      if (referralCode)
        await this.memberReferralService.updateFromReferralCode({
          referralCode,
          referredMember: createdMember,
        });

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
    const email = updateDto.email;
    const password = updateDto.password;
    const updateLoginCredentials = updateDto.updateLoginCredentials;

    delete updateDto.updateLoginCredentials;
    delete updateDto.channelProfile;
    delete updateDto.email;
    delete updateDto.password;
    const result = await this.memberRepository.update({ id: id }, updateDto);

    const member = await this.memberRepository.findOne({
      where: { id: id },
      relations: ['identity'],
    });

    if (updateLoginCredentials) {
      const hashedPassword = this.jwtService.getHashPassword(password);
      const updatedAdmin = await this.memberRepository.findOne({
        where: { id },
        relations: ['identity'], // Explicitly specify the relations
      });

      await this.identityService.updateLogin(
        updatedAdmin.identity.id,
        email,
        hashedPassword,
      );
    }

    return HttpStatus.OK;
  }

  async remove(id: number) {
    const member = await this.memberRepository.findOne({
      where: { id: id },
      relations: ['identity'], // Ensure you load the identity relation
    });

    if (!member) throw new NotFoundException();

    await this.memberRepository.delete(id);
    await this.identityService.remove(member.identity?.id);

    return HttpStatus.OK;
  }

  async paginate(paginateDto: PaginateRequestDto) {
    const query = this.memberRepository.createQueryBuilder('member');
    // query.orderBy('admin.created_at', 'DESC');
    // Add relation to the identity entity
    query.leftJoinAndSelect('member.identity', 'identity'); // Join with identity
    // .leftJoinAndSelect('identity.profile', 'profile'); // Join with profile through identity
    // Sort records by created_at from latest to oldest

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
    const [rows, total] = await query.getManyAndCount();
    const dtos = plainToInstance(MemberResponseDto, rows);

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    // Return paginated result
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

  async exportRecords(startDate: string, endDate: string) {
    startDate = parseStartDate(startDate);
    endDate = parseEndDate(endDate);

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    const [rows, total] = await this.memberRepository.findAndCount({
      relations: [
        'identity',
        'identity.channelProfileFilledFields',
        'identity.channelProfileFilledFields.field',
        'identity.channelProfileFilledFields.field.channel',
      ],
      where: {
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    const dtos = plainToInstance(MemberResponseDto, rows);

    return {
      data: dtos,
      total,
    };
  }

  async getProfile(id: number) {
    const profile = await this.findOne(id);
    if (!profile.enabled) {
      throw new UnauthorizedException('Unauthorized.');
    }

    return profile;
  }

  async changePassword(changePasswordDto: ChangePasswordDto, id: number) {
    const membaeData = await this.memberRepository.findOne({
      where: { id },
      relations: ['identity'],
    });

    if (!membaeData) throw new NotFoundException();

    return this.identityService.changePassword(
      changePasswordDto,
      membaeData.identity.id,
    );
  }
}
