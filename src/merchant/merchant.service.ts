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
import { ChannelService } from 'src/channel/channel.service';
import { JwtService } from 'src/services/jwt/jwt.service';
import { plainToInstance } from 'class-transformer';
import { MerchantResponseDto } from './dto/merchant-response.dto';
import { IP } from 'src/identity/entities/ip.entity';
import { PayinMode } from './entities/payinMode.entity';
import { AmountRangePayinMode } from './entities/amountRangePayinMode.entity';
import { ProportionalPayinMode } from './entities/proportionalPayinMode.entity';
import { identity } from 'rxjs';
import {
  parseStartDate,
  parseEndDate,
  PaginateRequestDto,
} from 'src/utils/dtos/paginate.dto';
import { encryptPassword } from 'src/utils/utils';

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

    private readonly identityService: IdentityService,
    private readonly channelService: ChannelService,
    private readonly jwtService: JwtService,
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
    const identity = await this.identityService.create(
      email,
      password,
      'MERCHANT',
    );

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
      withdrawalPassword: this.jwtService.getHashPassword(password),
    });

    const createdMerchant = await this.merchantRepository.save(merchant);

    // add ips
    await this.identityService.updateIps(ipAddresses, identity);

    // add payin and payout channels

    await this.channelService.updatePayinPayoutChannels(
      identity,
      payinChannels,
      'Payin',
    );

    await this.channelService.updatePayinPayoutChannels(
      identity,
      payoutChannels,
      'Payout',
    );

    // add payin mode
    await this.updatePayinModeDetails(
      createdMerchant.id,
      payinMode,
      numberOfRangesOrRatio,
      amountRanges,
      ratios,
    );

    // Process the channels and their profile fields
    await this.channelService.processChannelFilledFields(
      channelProfile,
      createdMerchant.identity,
    );

    return HttpStatus.OK;
  }

  async findAll() {
    const results = await this.merchantRepository.find({
      relations: [
        'identity',
        'identity.channelProfileFilledFields',
        'identity.channelProfileFilledFields.field',
        'identity.channelProfileFilledFields.field.channel',
        'identity.ips',
        'identity.payinPayoutChannels',
        'identity.payinPayoutChannels.channel',
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
        'identity.channelProfileFilledFields',
        'identity.channelProfileFilledFields.field',
        'identity.channelProfileFilledFields.field.channel',
        'identity.ips',
        'identity.payinPayoutChannels',
        'identity.payinPayoutChannels.channel',
        'payinModeDetails',
        'payinModeDetails.proportionalRange',
        'payinModeDetails.amountRangeRange',
      ],
    });

    return plainToInstance(MerchantResponseDto, results);
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
    delete updateDto.payinChannels;
    delete updateDto.payoutChannels;
    delete updateDto.ipAddresses;
    delete updateDto.numberOfRangesOrRatio,
      delete updateDto.amountRanges,
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
    await this.channelService.updatePayinPayoutChannels(
      merchant.identity,
      payinChannels,
      'Payin',
    );

    await this.channelService.updatePayinPayoutChannels(
      merchant.identity,
      payoutChannels,
      'Payout',
    );

    // update payin mode
    await this.updatePayinModeDetails(
      id,
      updateDto.payinMode,
      numberOfRangesOrRatio,
      amountRanges,
      ratios,
    );

    await this.channelService.processChannelFilledFields(
      channelProfile,
      merchant.identity,
    );

    return HttpStatus.OK;
  }

  async remove(id: number) {
    const admin = await this.merchantRepository.findOne({
      where: { id: id },
      relations: ['identity'], // Ensure you load the identity relation
    });

    if (!admin) throw new NotFoundException();

    // delete ips
    await this.identityService.deleteIps(admin.identity);
    // delete payin and payout channels
    await this.channelService.deletePayinPayoutChannels(admin.identity);
    // delete payin mode
    await this.deletePayinMode(id);

    this.channelService.deleteChannelProfileOfUser(admin.identity);
    this.merchantRepository.delete(id);
    this.identityService.remove(admin.identity?.id);

    return HttpStatus.OK;
  }

  async updatePayinModeDetails(
    merchantId: number,
    modeType: 'DEFAULT' | 'PROPORTIONAL' | 'AMOUNT_RANGE',
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
      } else if (modeType === 'AMOUNT_RANGE') {
        const ranges: AmountRangePayinMode[] = [];

        for (const data of rangeDtos) {
          const range = new AmountRangePayinMode();
          range.gateway = data.gateway;
          range.payinMode = createdPayinMode;
          range.lower = data.lower;
          range.upper = data.upper;

          ranges.push(range);
        }
        console.log('DONE');
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
        'identity.channelProfileFilledFields',
        'identity.channelProfileFilledFields.field',
        'identity.channelProfileFilledFields.field.channel',
        'identity.ips',
        'identity.payinPayoutChannels',
        'identity.payinPayoutChannels.channel',
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
}
