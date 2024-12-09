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

@Injectable()
export class MemberReferralService {
  referralLimit = 2;

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

    await this.memberReferralRepository.save({
      referralCode,
      member,
      payinCommission,
      payoutCommission,
      topupCommission,
      referredMemberPayinCommission,
      referredMemberPayoutCommission,
      referredMemberTopupCommission,
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

  async updateFromReferralCode({
    referralCode,
    referredMemberPayinCommission = null,
    referredMemberPayoutCommission = null,
    referredMemberTopupCommission = null,
    referredMember = null,
  }) {
    const memberReferral = await this.memberReferralRepository.findOne({
      where: { referralCode },
    });

    if (!memberReferral)
      throw new NotFoundException('Member Referral not found!');

    const updateData = {
      status: 'utilized',
      ...(referredMemberPayinCommission !== null && {
        referredMemberPayinCommission,
      }),
      ...(referredMemberPayoutCommission !== null && {
        referredMemberPayoutCommission,
      }),
      ...(referredMemberTopupCommission !== null && {
        referredMemberTopupCommission,
      }),
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

  // Method to fetch and build the referral tree starting from the root member
  async getReferralTree(): Promise<any> {
    const rootReferral = await this.memberReferralRepository.findOne({
      where: {
        referralCode: null,
        status: 'utilized',
      },
      relations: ['member', 'member.identity'],
    });

    if (!rootReferral) return null;

    const rootMember = rootReferral.member;
    return this.buildTree(rootMember);
  }

  // Recursive method to build the tree structure
  private async buildTree(member: Member): Promise<any> {
    const referrals = await this.memberReferralRepository.find({
      where: {
        member: { id: member.id },
        status: 'utilized',
      },
      relations: ['referredMember', 'referredMember.identity'],
    });

    // Recursively build children tree for each referred member
    const children = await Promise.all(
      referrals.map(async (referral) => {
        if (referral.referredMember) {
          const childTree = await this.buildTree(referral.referredMember);

          return {
            id: referral.referredMember.id,
            uniqueId: referral.referredMember.identity.id,
            firstName: referral.referredMember.firstName,
            lastName: referral.referredMember.lastName,
            referralCode: referral.referredMember.referralCode,
            email: referral.referredMember.identity.email,
            payinCommission: referral.payinCommission,
            payoutCommission: referral.payoutCommission,
            topupCommission: referral.topupCommission,
            referredMemberPayinCommission:
              referral.referredMemberPayinCommission,
            referredMemberPayoutCommission:
              referral.referredMemberPayoutCommission,
            referredMemberTopupCommission:
              referral.referredMemberTopupCommission,
            balance: referral.referredMember.balance,
            quota: referral.referredMember.quota,

            children: childTree.children,
          };
        }
        return null;
      }),
    );

    return {
      id: member.id,
      uniqueId: member.identity.id,
      firstName: member.firstName,
      lastName: member.lastName,
      referralCode: member.referralCode,
      email: member.identity.email,
      payinCommission: member.payinCommissionRate,
      payoutCommission: member.payoutCommissionRate,
      topupCommission: member.topupCommissionRate,
      balance: member.balance,
      quota: member.quota,
      children: children.filter((child) => child !== null),
    };
  }

  async getReferralTreeOfUser(userId: number) {
    const referralTree = await this.getReferralTree();
    if (!referralTree) {
      const member = await this.memberRepository.findOne({
        where: { identity: { id: userId } },
        relations: ['identity'],
      });
      if (!member) return null;

      return {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        referralCode: member.referralCode,
        email: member.identity.email,
        balance: member.balance,
        quota: member.quota,
        payinCommission: member.payinCommissionRate,
        payoutCommission: member.payoutCommissionRate,
        topupCommission: member.topupCommissionRate,
        children: [],
      };
    }
    return await this.trimTreeToUser(referralTree, userId);
  }

  private async trimTreeToUser(tree: any, userId: number): Promise<any> {
    if (tree.uniqueId === userId)
      return {
        id: tree.id,
        firstName: tree.firstName,
        lastName: tree.lastName,
        referralCode: tree.referralCode,
        email: tree.email,
        balance: tree.balance,
        quota: tree.quota,
        payinCommission: tree.payinCommission,
        payoutCommission: tree.payoutCommission,
        topupCommission: tree.topupCommission,
        children: [],
      };

    const trimmedChildren = await Promise.all(
      tree.children.map((child: any) => this.trimTreeToUser(child, userId)),
    );

    if (trimmedChildren.length > 0)
      return {
        ...tree,
        children: trimmedChildren,
      };

    const member = await this.memberRepository.findOne({
      where: { identity: { id: userId } },
      relations: ['identity'],
    });
    if (!member) return null;

    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      referralCode: member.referralCode,
      email: member.identity.email,
      balance: member.balance,
      quota: member.quota,
      payinCommission: member.payinCommissionRate,
      payoutCommission: member.payoutCommissionRate,
      topupCommission: member.topupCommissionRate,
      children: [],
    };
  }
}
