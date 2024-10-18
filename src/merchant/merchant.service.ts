import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateMerchantDto,
  RangeDto,
  RatioDto,
} from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Merchant } from './entities/merchant.entity';
import { Repository, Between } from 'typeorm';
import { IdentityService } from 'src/identity/identity.service';
import { JwtService } from 'src/services/jwt/jwt.service';
import { plainToInstance } from 'class-transformer';
import { MerchantResponseDto } from './dto/merchant-response.dto';
import { IP } from 'src/identity/entities/ip.entity';
import { PayinMode } from './entities/payinMode.entity';
import { AmountRangePayinMode } from './entities/amountRangePayinMode.entity';
import { ProportionalPayinMode } from './entities/proportionalPayinMode.entity';
import {
  parseStartDate,
  parseEndDate,
  PaginateRequestDto,
} from 'src/utils/dtos/paginate.dto';
import { ChangePasswordDto } from 'src/identity/dto/changePassword.dto';
import { AgentReferralService } from 'src/agent-referral/agent-referral.service';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { OrderType, UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { userInfo } from 'os';
import { Upi } from 'src/channel/entity/upi.entity';
import { NetBanking } from 'src/channel/entity/net-banking.entity';
import { EWallet } from 'src/channel/entity/e-wallet.entity';

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,

    @InjectRepository(IP)
    private readonly IpRepository: Repository<IP>,

    @InjectRepository(PayinMode)
    private readonly payinModeRepository: Repository<PayinMode>,

    @InjectRepository(AmountRangePayinMode)
    private readonly amountRangeRepository: Repository<AmountRangePayinMode>,

    @InjectRepository(ProportionalPayinMode)
    private readonly proportionalRepository: Repository<ProportionalPayinMode>,

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
    private readonly agentReferralService: AgentReferralService,
  ) {}

  async create(createMerchantDto: CreateMerchantDto) {
    const {
      email,
      password,
      enabled,
      firstName,
      lastName,
      businessUrl,
      businessName,
      allowMemberChannelsPayin,
      allowMemberChannelsPayout,
      allowPgBackupForPayin,
      allowPgBackupForPayout,
      ipAddresses,
      maxPayout,
      minPayout,
      maxWithdrawal,
      minWithdrawal,
      payinChannels,
      payoutChannels,
      payinServiceRate,
      payoutServiceRate,
      withdrawalServiceRate,
      withdrawalPassword,
      phone,
      referralCode,
      channelProfile,
      payinMode,
      numberOfRangesOrRatio,
      amountRanges,
      ratios,
    } = createMerchantDto;

    if (referralCode) {
      const isCodeValid = await this.agentReferralService.validateReferralCode(
        referralCode,
        'merchant',
      );
      if (!isCodeValid) return;
    }

    const identity = await this.identityService.create(
      email,
      password,
      'MERCHANT',
    );

    const hashedWithdrawalPassword =
      this.jwtService.getHashPassword(withdrawalPassword);

    // Create and save the Admin
    const merchant = this.merchantRepository.create({
      identity,
      enabled,
      firstName,
      lastName,
      businessUrl,
      businessName,
      allowMemberChannelsPayin,
      allowMemberChannelsPayout,
      allowPgBackupForPayin,
      allowPgBackupForPayout,
      maxPayout,
      minPayout,
      maxWithdrawal,
      minWithdrawal,
      payinServiceRate,
      payoutServiceRate,
      withdrawalServiceRate,
      phone,
      referralCode,
      payinMode,
      integrationId: '11',
      withdrawalPassword: hashedWithdrawalPassword,
      payinChannels,
      payoutChannels,
    });

    const createdMerchant = await this.merchantRepository.save(merchant);

    if (channelProfile?.upi && channelProfile.upi.length > 0) {
      for (const element of channelProfile.upi) {
        await this.upiRepository.save({
          ...element,
          identity,
        });
      }
    }

    if (channelProfile?.eWallet && channelProfile.eWallet.length > 0) {
      for (const element of channelProfile.eWallet) {
        await this.eWalletRepository.save({
          ...element,
          identity,
        });
      }
    }

    if (channelProfile?.netBanking && channelProfile.netBanking.length > 0) {
      for (const element of channelProfile.netBanking) {
        await this.netBankingRepository.save({
          ...element,
          identity,
        });
      }
    }

    // add ips
    if (ipAddresses)
      await this.identityService.updateIps(ipAddresses, identity);

    // add payin and payout channels

    // add payin mode
    await this.updatePayinModeDetails(
      createdMerchant.id,
      payinMode,
      numberOfRangesOrRatio,
      amountRanges,
      ratios,
    );

    // Process the channels and their profile fields

    // Update Agent Referrals
    if (referralCode)
      await this.agentReferralService.updateFromReferralCode({
        referralCode,
        merchantPayinServiceRate: payinServiceRate,
        merchantPayoutServiceRate: payoutServiceRate,
        referredMerchant: createdMerchant,
      });

    return HttpStatus.OK;
  }

  async findAll() {
    const results = await this.merchantRepository.find({
      relations: [
        'identity',
        'identity.ips',
        'payinModeDetails',
        'payinModeDetails.proportionalRange',
        'payinModeDetails.amountRangeRange',
      ],
    });

    return plainToInstance(MerchantResponseDto, results);
  }

  async findOne(id: number) {
    const results = await this.merchantRepository.findOne({
      where: { id },
      relations: [
        'identity',
        'identity.upi',
        'identity.eWallet',
        'identity.netBanking',
        'identity.ips',
        'payinModeDetails',
        'payinModeDetails.proportionalRange',
        'payinModeDetails.amountRangeRange',
      ],
    });

    const newPayinChannels = JSON.parse(results.payinChannels);
    const newPayoutChannels = JSON.parse(results.payoutChannels);

    delete results.payinChannels;
    delete results.payoutChannels;

    return plainToInstance(MerchantResponseDto, {
      ...results,
      payoutChannels: newPayoutChannels,
      payinChannels: newPayinChannels,
    });
  }

  async update(id: number, updateDto: UpdateMerchantDto) {
    const channelProfile = updateDto.channelProfile;
    const payinChannels = updateDto.payinChannels;
    const payoutChannels = updateDto.payoutChannels;
    const ipAddresses = updateDto.ipAddresses;
    const numberOfRangesOrRatio = updateDto.numberOfRangesOrRatio;
    const amountRanges = updateDto.amountRanges;
    const ratios = updateDto.ratios;
    const email = updateDto.email;
    const password = updateDto.password;
    const updateLoginCredentials = updateDto.updateLoginCredentials;
    const updateWithdrawalCredentials = updateDto.updateWithdrawalCredentials;

    delete updateDto.updateLoginCredentials;
    delete updateDto.updateWithdrawalCredentials;

    delete updateDto.channelProfile;
    delete updateDto.email;
    delete updateDto.password;
    delete updateDto.ipAddresses;
    delete updateDto.numberOfRangesOrRatio;
    delete updateDto.amountRanges;
    delete updateDto.ratios;

    let result = null;

    if (updateWithdrawalCredentials)
      result = await this.merchantRepository.update(
        { id: id },
        {
          ...updateDto,
          withdrawalPassword: this.jwtService.getHashPassword(
            updateDto.withdrawalPassword,
          ),
        },
      );
    else {
      delete updateDto.withdrawalPassword;
      result = await this.merchantRepository.update({ id: id }, updateDto);
    }

    const merchant = await this.merchantRepository.findOne({
      where: { id: id },
      relations: ['identity'],
    });

    // Deleting all existing Data
    await this.upiRepository.delete({
      identity: {
        id: merchant.identity.id,
      },
    });
    await this.eWalletRepository.delete({
      identity: {
        id: merchant.identity.id,
      },
    });
    await this.netBankingRepository.delete({
      identity: {
        id: merchant.identity.id,
      },
    });

    if (channelProfile?.upi && channelProfile.upi.length > 0) {
      for (const element of channelProfile.upi) {
        await this.upiRepository.save({
          ...element,
          identity: merchant.identity,
        });
      }
    }

    if (channelProfile?.eWallet && channelProfile.eWallet.length > 0) {
      for (const element of channelProfile.eWallet) {
        await this.eWalletRepository.save({
          ...element,
          identity: merchant.identity,
        });
      }
    }

    if (channelProfile?.netBanking && channelProfile.netBanking.length > 0) {
      for (const element of channelProfile.netBanking) {
        await this.netBankingRepository.save({
          ...element,
          identity: merchant.identity,
        });
      }
    }

    if (updateLoginCredentials) {
      const hashedPassword = this.jwtService.getHashPassword(password);
      const updatedAdmin = await this.merchantRepository.findOne({
        where: { id },
        relations: ['identity'], // Explicitly specify the relations
      });

      await this.identityService.updateLogin(
        updatedAdmin.identity.id,
        email,
        hashedPassword,
      );
    }

    // update ips
    await this.identityService.updateIps(ipAddresses, merchant.identity);
    // update payin and payout channels

    // update payin mode
    await this.updatePayinModeDetails(
      id,
      updateDto.payinMode,
      numberOfRangesOrRatio,
      amountRanges,
      ratios,
    );

    return HttpStatus.OK;
  }

  async remove(id: number) {
    const merchant = await this.merchantRepository.findOne({
      where: { id: id },
      relations: ['identity', 'submerchants'], // Ensure you load the identity relation
    });

    if (!merchant) throw new NotFoundException();

    // delete ips
    await this.identityService.deleteIps(merchant.identity);
    // delete payin and payout channels
    // delete payin mode
    await this.deletePayinMode(id);

    await this.merchantRepository.delete(id);
    await this.identityService.remove(merchant.identity?.id);

    return HttpStatus.OK;
  }

  async updatePayinModeDetails(
    merchantId: number,
    modeType: 'DEFAULT' | 'PROPORTIONAL' | 'AMOUNT RANGE',
    numberOfRangesOrRatio?: number,
    rangeDtos?: RangeDto[],
    ratioDtos?: RatioDto[],
  ) {
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId },
    });

    // Step 1: Delete existing associated with the merchant
    await this.deletePayinMode(merchantId);

    // Step 2: Create new payinmode entity
    if (modeType !== 'DEFAULT') {
      const payinMode = await this.payinModeRepository.create({
        number: numberOfRangesOrRatio,
        type: modeType,
        merchant: merchant,
      });
      const createdPayinMode = await this.payinModeRepository.save(payinMode);

      if (modeType === 'PROPORTIONAL') {
        const proportions: ProportionalPayinMode[] = [];

        for (const data of ratioDtos) {
          const proportion = new ProportionalPayinMode();
          proportion.gateway = data.gateway;
          proportion.payinMode = createdPayinMode;
          proportion.ratio = data.ratio;

          proportions.push(proportion);
        }

        return this.proportionalRepository.save(proportions);
      } else if (modeType === 'AMOUNT RANGE') {
        const ranges: AmountRangePayinMode[] = [];

        for (const data of rangeDtos) {
          const range = new AmountRangePayinMode();
          range.gateway = data.gateway;
          range.payinMode = createdPayinMode;
          range.lower = data.lower;
          range.upper = data.upper;

          ranges.push(range);
        }
        return this.amountRangeRepository.save(ranges);
      }
    }
  }

  async deletePayinMode(merchantId: number): Promise<void> {
    // Find the PayinMode entity
    const payinMode = await this.payinModeRepository.findOne({
      where: { merchant: { id: merchantId } },
      relations: ['proportionalRange', 'amountRangeRange'],
    });

    if (payinMode) {
      // Delete related ProportionalPayinMode entities
      if (payinMode.proportionalRange.length > 0) {
        await this.proportionalRepository.delete(
          payinMode.proportionalRange.map((mode) => mode.id),
        );
      }

      // Delete related AmountRangePayinMode entities
      if (payinMode.amountRangeRange.length > 0) {
        await this.amountRangeRepository.delete(
          payinMode.amountRangeRange.map((range) => range.id),
        );
      }

      // Finally, delete the PayinMode entity
      await this.payinModeRepository.delete({ merchant: { id: merchantId } });
    }
  }

  async exportRecords(startDate: string, endDate: string) {
    startDate = parseStartDate(startDate);
    endDate = parseEndDate(endDate);

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    const [rows, total] = await this.merchantRepository.findAndCount({
      relations: [
        'identity',
        'identity.ips',
        'payinModeDetails',
        'payinModeDetails.proportionalRange',
        'payinModeDetails.amountRangeRange',
      ],
      where: {
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    const dtos = plainToInstance(MerchantResponseDto, rows);

    return {
      data: dtos,
      total,
    };
  }

  async paginate(paginateDto: PaginateRequestDto) {
    const query = this.merchantRepository.createQueryBuilder('merchant');
    // query.orderBy('admin.created_at', 'DESC');
    // Add relation to the identity entity
    query.leftJoinAndSelect('merchant.identity', 'identity'); // Join with identity
    // .leftJoinAndSelect('identity.profile', 'profile'); // Join with profile through identity
    // Sort records by created_at from latest to oldest

    const search = paginateDto.search;
    const pageSize = paginateDto.pageSize;
    const pageNumber = paginateDto.pageNumber;
    // Handle search by first_name + " " + last_name
    if (search) {
      query.andWhere(
        `CONCAT(merchant.first_name, ' ', merchant.last_name) ILIKE :search`,
        { search: `%${search}%` },
      );
    }

    // Handle filtering by created_at between startDate and endDate
    if (paginateDto.startDate && paginateDto.endDate) {
      const startDate = parseStartDate(paginateDto.startDate);
      const endDate = parseEndDate(paginateDto.endDate);

      query.andWhere('merchant.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Handle pagination
    const skip = (pageNumber - 1) * pageSize;
    query.skip(skip).take(pageSize);

    // Execute query
    const [rows, total] = await query.getManyAndCount();

    const dtos = plainToInstance(MerchantResponseDto, rows);

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

  async getProfile(id: number) {
    const profile = await this.findOne(id);
    if (!profile.enabled) {
      throw new UnauthorizedException('Unauthorized.');
    }

    return profile;
  }

  async changePassword(changePasswordDto: ChangePasswordDto, id: number) {
    const merchantData = await this.merchantRepository.findOne({
      where: { id },
      relations: ['identity'],
    });

    if (!merchantData) throw new NotFoundException();

    return this.identityService.changePassword(
      changePasswordDto,
      merchantData.identity.id,
    );
  }

  async changeWithdrawalPassword(
    changePasswordDto: ChangePasswordDto,
    id: number,
  ) {
    const merchantData = await this.merchantRepository.findOne({
      where: { id },
    });

    if (!merchantData) throw new NotFoundException();

    const isPasswordCorrect = this.jwtService.isHashedPasswordVerified(
      changePasswordDto.oldPassword,
      merchantData.withdrawalPassword,
    );

    if (!isPasswordCorrect) throw new UnauthorizedException();

    const newHashedPassword = this.jwtService.getHashPassword(
      changePasswordDto.newPassword,
    );

    await this.merchantRepository.update(id, {
      withdrawalPassword: newHashedPassword,
    });

    return { message: 'Withdrawal password changed.' };
  }

  async updateBalance(identityId, amount, failed) {
    const merchant = await this.merchantRepository.findOne({
      where: {
        identity: identityId,
      },
      relations: ['identity'],
    });

    if (!merchant) throw new NotFoundException('Merchant not found!');

    await this.merchantRepository.update(merchant.id, {
      balance: merchant.balance + amount,
    });

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          user: identityId,
          pending: true,
        },
        relations: ['identity'],
      });

    for (const entry of transactionUpdateEntries) {
      let beforeValue = merchant.balance;
      let afterValue = 0;

      if (entry.userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE)
        afterValue = merchant.balance + amount;

      if (failed) afterValue = merchant.balance;

      await this.transactionUpdateRepository.update(entry.user?.id, {
        before: beforeValue,
        after: afterValue,
      });
    }
  }
}
