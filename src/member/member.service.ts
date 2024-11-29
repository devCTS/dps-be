import { systemConfigData } from './../system-config/data/system-config.data';
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
import { Repository, Between, Not } from 'typeorm';
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
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { Upi } from 'src/channel/entity/upi.entity';
import { NetBanking } from 'src/channel/entity/net-banking.entity';
import { EWallet } from 'src/channel/entity/e-wallet.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,

    @InjectRepository(Upi)
    private readonly upiRepository: Repository<Upi>,

    @InjectRepository(NetBanking)
    private readonly netBankingRepository: Repository<NetBanking>,

    @InjectRepository(EWallet)
    private readonly eWalletRepository: Repository<EWallet>,

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
    });

    const createdMember = await this.memberRepository.save(member);

    if (channelProfile?.upi) {
      for (const element of channelProfile.upi) {
        await this.upiRepository.save({
          ...element,
          identity,
        });
      }
    }

    if (channelProfile?.eWallet) {
      for (const element of channelProfile.eWallet) {
        await this.upiRepository.save({
          ...element,
          identity,
        });
      }
    }

    if (channelProfile?.netBanking) {
      for (const element of channelProfile.netBanking) {
        await this.upiRepository.save({
          ...element,
          identity,
        });
      }
    }

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
        selfRegistered: true,
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
        'identity.upi',
        'identity.eWallet',
        'identity.netBanking',
      ],
    });

    return plainToInstance(MemberResponseDto, results);
  }

  async findOne(id: number): Promise<any> {
    const results = await this.memberRepository.findOne({
      where: { id },
      relations: [
        'identity',
        'identity.upi',
        'identity.eWallet',
        'identity.netBanking',
      ],
    });

    return plainToInstance(MemberResponseDto, results);
  }

  async update(id: number, updateDto: UpdateMemberDto): Promise<HttpStatus> {
    const memberData = await this.memberRepository.findOneBy({ id });

    if (!memberData) throw new NotFoundException('Member not found.');

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

    // Deleting all existing Data
    await this.upiRepository.delete({
      identity: {
        id: member.identity.id,
      },
    });
    await this.eWalletRepository.delete({
      identity: {
        id: member.identity.id,
      },
    });
    await this.netBankingRepository.delete({
      identity: {
        id: member.identity.id,
      },
    });

    // Adding all the channels
    if (channelProfile?.upi && channelProfile.upi.length > 0) {
      for (const element of channelProfile.upi) {
        await this.upiRepository.save({
          ...element,
          identity: member.identity,
        });
      }
    }

    if (channelProfile?.eWallet) {
      for (const element of channelProfile.eWallet) {
        await this.eWalletRepository.save({
          ...element,
          identity: member.identity,
        });
      }
    }

    if (channelProfile?.netBanking) {
      for (const element of channelProfile.netBanking) {
        await this.netBankingRepository.save({
          ...element,
          identity: member.identity,
        });
      }
    }

    if (updateLoginCredentials) {
      const updatedAdmin = await this.memberRepository.findOne({
        where: { id },
        relations: ['identity'], // Explicitly specify the relations
      });

      await this.identityService.updateLogin(
        updatedAdmin.identity.id,
        email,
        password,
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
    query.leftJoinAndSelect('member.memberReferral', 'memberReferral');

    const search = paginateDto.search;
    const pageSize = paginateDto.pageSize;
    const pageNumber = paginateDto.pageNumber;
    const sortBy = paginateDto.sortBy;

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

    if (sortBy)
      sortBy === 'latest'
        ? query.orderBy('member.createdAt', 'DESC')
        : query.orderBy('member.createdAt', 'ASC');

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
      relations: ['identity'],
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

  async updateQuota(
    identityId,
    systemOrderId,
    amount,
    failed,
    updateTransactionEntries = true,
  ) {
    const member = await this.memberRepository.findOne({
      where: {
        identity: { id: identityId },
      },
      relations: ['identity'],
    });

    if (!member) throw new NotFoundException('Member not found!');

    await this.memberRepository.update(member.id, {
      quota: member.quota + amount,
    });

    const updatedMember = await this.memberRepository.findOne({
      where: { identity: { id: identityId } },
      relations: ['identity'],
    });

    let whereCondition;
    whereCondition = {
      userType: UserTypeForTransactionUpdates.MEMBER_QUOTA,
      user: { id: identityId },
      pending: true,
    };
    if (failed) whereCondition.systemOrderId = systemOrderId;
    else whereCondition.systemOrderId = Not(systemOrderId);

    if (updateTransactionEntries) {
      const transactionUpdateMembers =
        await this.transactionUpdateRepository.find({
          where: whereCondition,
          relations: ['user'],
        });

      for (const transactionUpdateMember of transactionUpdateMembers) {
        let beforeValue = updatedMember.quota;
        let afterValue = failed ? updatedMember.quota : beforeValue + amount;

        if (transactionUpdateMember)
          if (failed)
            await this.transactionUpdateRepository.update(
              transactionUpdateMember.id,
              {
                before: beforeValue,
                after: afterValue,
                amount: 0,
                rate: 0,
              },
            );
          else
            await this.transactionUpdateRepository.update(
              transactionUpdateMember.id,
              {
                before: beforeValue,
                after: afterValue,
              },
            );
      }
    }
  }

  async updateBalance(identityId, systemOrderId, amount, failed) {
    const member = await this.memberRepository.findOne({
      where: {
        identity: { id: identityId },
      },
      relations: ['identity'],
    });

    if (!member) throw new NotFoundException('Member not found!');

    await this.memberRepository.update(member.id, {
      balance: member.balance + amount,
    });

    const updatedMember = await this.memberRepository.findOne({
      where: { identity: { id: identityId } },
      relations: ['identity'],
    });

    let whereCondition;
    whereCondition = {
      userType: UserTypeForTransactionUpdates.MEMBER_BALANCE,
      user: { id: identityId },
      pending: true,
    };
    if (failed) whereCondition.systemOrderId = systemOrderId;
    else whereCondition.systemOrderId = Not(systemOrderId);

    const transactionUpdateMembers =
      await this.transactionUpdateRepository.find({
        where: whereCondition,
        relations: ['user'],
      });

    for (const transactionUpdateMember of transactionUpdateMembers) {
      let beforeValue = updatedMember.balance;
      let afterValue = failed ? updatedMember.balance : amount + beforeValue;

      if (transactionUpdateMember)
        if (failed)
          await this.transactionUpdateRepository.update(
            transactionUpdateMember.id,
            {
              before: beforeValue,
              after: afterValue,
              amount: 0,
              rate: 0,
            },
          );
        else
          await this.transactionUpdateRepository.update(
            transactionUpdateMember.id,
            {
              before: beforeValue,
              after: afterValue,
            },
          );
    }
  }
}
