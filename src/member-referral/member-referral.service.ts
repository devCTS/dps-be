import { systemConfigData } from './../system-config/data/system-config.data';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberReferralDto } from './dto/create-member-referral.dto';
import { UpdateMemberReferralDto } from './dto/update-member-referral.dto';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberReferral } from './entities/member-referral.entity';
import { Between, ILike, In, Not, Repository } from 'typeorm';
import { Member } from 'src/member/entities/member.entity';
import { SystemConfig } from 'src/system-config/entities/system-config.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { Team } from 'src/team/entities/team.entity';
import { TeamService } from 'src/team/team.service';

@Injectable()
export class MemberReferralService {
  referralLimit = 5;

  constructor(
    @InjectRepository(MemberReferral)
    private readonly memberReferralRepository: Repository<MemberReferral>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    private readonly systemConfigService: SystemConfigService,
    private readonly teamService: TeamService,
  ) {}

  async create(createMemberReferralDto: CreateMemberReferralDto) {
    const {
      referralCode,
      memberId,
      payinCommission,
      payoutCommission,
      topupCommission,
    } = createMemberReferralDto;

    const member = await this.memberRepository.findOne({
      where: { id: memberId },
    });
    if (!member) throw new NotFoundException('Member not found!');

    const currentReferralCount = await this.memberReferralRepository.count({
      where: {
        member: { id: member.id },
        status: In(['pending', 'utilized']),
      },
      relations: ['member'],
    });

    if (currentReferralCount >= this.referralLimit)
      throw new NotAcceptableException(
        `You can only generate maxiumum ${this.referralLimit} referral codes.`,
      );

    const { payinSystemProfitRate, payoutSystemProfitRate } =
      await this.systemConfigService.findLatest();

    const ancestors = await this.teamService.getAncestorsWithCommissionRates(
      member?.teamId,
      memberId,
    );

    const totalAncestorsPayinRate = ancestors.reduce(
      (sum, ancestor) => sum + ancestor?.commissionRates?.payin,
      0,
    );

    const totalAncestorsPayoutRate = ancestors.reduce(
      (sum, ancestor) => sum + ancestor?.commissionRates?.payout,
      0,
    );

    const totalAncestorsTopupRate = ancestors.reduce(
      (sum, ancestor) => sum + ancestor?.commissionRates?.topup,
      0,
    );

    const maxRateLeftForPayinCommission =
      100 -
      payinSystemProfitRate -
      totalAncestorsPayinRate -
      (await this.getDirectMemberRates(member?.teamId)).payinRate;

    const maxRateLeftForPayoutCommission =
      100 -
      payoutSystemProfitRate -
      totalAncestorsPayoutRate -
      (await this.getDirectMemberRates(member?.teamId)).payoutRate;

    const maxRateLeftForTopupCommission =
      100 -
      totalAncestorsTopupRate -
      (await this.getDirectMemberRates(member?.teamId)).topupRate;

    if (payinCommission > maxRateLeftForPayinCommission)
      return {
        error: true,
        forPayin: true,
        messsage: `Maximum payin commission rate - ${maxRateLeftForPayinCommission}%`,
      };

    if (payoutCommission > maxRateLeftForPayoutCommission)
      return {
        error: true,
        forPayout: true,
        messsage: `Maximum payout commission rate - ${maxRateLeftForPayoutCommission}%`,
      };

    if (topupCommission > maxRateLeftForTopupCommission)
      return {
        error: true,
        forTopup: true,
        messsage: `Maximum topup commission rate - ${maxRateLeftForTopupCommission}%`,
      };

    if (
      maxRateLeftForPayinCommission <= 0 &&
      maxRateLeftForPayoutCommission <= 0 &&
      maxRateLeftForTopupCommission <= 0
    )
      throw new NotAcceptableException(
        'Referral commissions are fully utilized!',
      );

    await this.memberReferralRepository.save({
      referralCode,
      member,
      payinCommission,
      payoutCommission,
      topupCommission,
    });

    return HttpStatus.OK;
  }

  async validateReferralCode(referralCode) {
    const isValidCode = await this.memberReferralRepository.findOne({
      where: {
        referralCode,
        status: 'pending',
      },
    });

    if (!isValidCode)
      throw new NotAcceptableException(
        'This referral code is invalid or not acceptable!',
      );

    return true;
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

  async findOneByCode(referralCode: string) {
    const memberReferral = await this.memberReferralRepository.findOneBy({
      referralCode,
    });

    if (!memberReferral) throw new NotFoundException('Referral not found!');

    return memberReferral;
  }

  async update(id: number, updateMemberReferralDto: UpdateMemberReferralDto) {
    const memberReferral = await this.memberReferralRepository.findOneBy({
      id,
    });
    if (!memberReferral) throw new NotFoundException();

    await this.memberReferralRepository.update(id, updateMemberReferralDto);

    return HttpStatus.OK;
  }

  async updateFromReferralCode({ referralCode, referredMember = null }) {
    const memberReferral = await this.memberReferralRepository.findOne({
      where: { referralCode },
    });

    if (!memberReferral)
      throw new NotFoundException('Member Referral not found!');

    const updateData = {
      status: 'utilized',
      ...(referredMember !== null && { referredMember }),
    };

    const updated = await this.memberReferralRepository.update(
      memberReferral.id,
      updateData,
    );

    if (!updated)
      throw new InternalServerErrorException(
        'Failed to update referrals entity!',
      );
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

  async paginate(paginateDto: PaginateRequestDto, showUsedCodes = false) {
    const { search, pageSize, pageNumber, startDate, endDate, userId, sortBy } =
      paginateDto;

    const whereConditions: any = {};

    if (showUsedCodes) whereConditions.status = 'utilized';

    if (userId) whereConditions.member = { id: userId };

    if (search) whereConditions.referralCode = ILike(`%${search}%`);

    if (startDate && endDate) {
      const parsedStartDate = parseStartDate(startDate);
      const parsedEndDate = parseEndDate(endDate);
      whereConditions.createdAt = Between(parsedStartDate, parsedEndDate);
    }

    let orderConditions: any = {};
    if (sortBy)
      if (sortBy === 'latest') {
        orderConditions['createdAt'] = 'DESC';
      } else {
        orderConditions['createdAt'] = 'ASC';
      }

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const [rows, total] = await this.memberReferralRepository.findAndCount({
      where: whereConditions,
      relations: [
        'member',
        'referredMember',
        'member.identity',
        'referredMember.identity',
      ],
      skip,
      take,
      order: orderConditions,
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

  private async getDirectMemberRates(teamId = null) {
    if (teamId) return await this.teamService.getTeamCommissionRate(teamId);

    const {
      payinCommissionRateForMember,
      payoutCommissionRateForMember,
      topupCommissionRateForMember,
    } = await this.systemConfigService.findLatest();

    return {
      payinRate: payinCommissionRateForMember,
      payoutRate: payoutCommissionRateForMember,
      topupRate: topupCommissionRateForMember,
    };
  }
}
