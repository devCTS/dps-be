import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { SystemConfig } from './entities/system-config.entity';

import { Identity } from 'src/identity/entities/identity.entity';

import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateGatewaysTimeoutsDto } from './dto/update-gateways-timeouts.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { UpdateTopupConfigDto } from './dto/update-topup-config.dto';
import { UpdateMemberDefaultsDto } from './dto/update-member-defaults.dto';
import { UpdateMerchantDefaultsDto } from './dto/update-merchant-defaults.dto';
import { plainToInstance } from 'class-transformer';
import { SystemConfigResponseDto } from './dto/system-config-response.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { UpdateWithdrawalDefaultsDto } from './dto/update-withdrawal-default.dto';

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
  ) {}

  async create(createSystemConfigDto: CreateSystemConfigDto) {
    const identity = await this.identityRepository.findOne({
      where: {
        userType: 'SUPER_ADMIN',
      },
    });
    if (!identity) throw new NotFoundException('Identity not found!');

    await this.systemConfigRepository.save(createSystemConfigDto);

    return HttpStatus.CREATED;
  }

  async findAll() {
    const results = await this.systemConfigRepository.find({
      relations: [
        'defaultPayinGateway',
        'defaultPayoutGateway',
        'defaultWithdrawalGateway',
        'defaultTopupChannels',
      ],
    });

    return results;
  }

  async findLatestWithResponseDto() {
    const latestResult = await this.systemConfigRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 1,
    });

    return plainToInstance(SystemConfigResponseDto, latestResult[0]);
  }

  async findLatest(withRelations: boolean = true) {
    const latestResult = await this.systemConfigRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 1,
      relations: withRelations
        ? [
            'defaultPayinGateway',
            'defaultPayoutGateway',
            'defaultWithdrawalGateway',
            'defaultTopupChannels',
            'defaultTopupChannels.field',
            'defaultTopupChannels.field.channel',
          ]
        : [],
    });

    return latestResult[0];
  }

  async updateGatewaysAndTimeouts(
    updateGatewaysTimeoutsDto: UpdateGatewaysTimeoutsDto,
  ) {
    const {
      defaultPayinGateway,
      defaultPayoutGateway,
      defaultWithdrawalGateway,
      payinTimeout,
      payoutTimeout,
    } = updateGatewaysTimeoutsDto;

    const latestResult = await this.findLatest(false);

    if (!latestResult) {
      await this.systemConfigRepository.save({
        payinTimeout,
        payoutTimeout,
      });

      return HttpStatus.CREATED;
    }

    delete latestResult.payinTimeout;
    delete latestResult.payoutTimeout;
    delete latestResult.id;
    delete latestResult.createdAt;
    delete latestResult.updatedAt;

    const newSystemConfig = this.systemConfigRepository.save({
      defaultPayinGateway,
      defaultPayoutGateway,
      defaultWithdrawalGateway,
      payinTimeout,
      payoutTimeout,
      ...latestResult,
    });

    if (!newSystemConfig) throw new InternalServerErrorException();

    return HttpStatus.OK;
  }

  async updateCurrency(currencyDto: UpdateCurrencyDto) {
    const { currency } = currencyDto;
    if (!currency) throw new NotAcceptableException('Currency Invalid!');

    const latestResult = await this.findLatest();

    if (!latestResult) {
      await this.systemConfigRepository.save({
        currency,
      });

      return HttpStatus.CREATED;
    }

    delete latestResult.currency;
    delete latestResult.id;
    delete latestResult.createdAt;
    delete latestResult.updatedAt;

    const newSystemConfig = this.systemConfigRepository.save({
      currency,
      ...latestResult,
    });

    if (!newSystemConfig) throw new InternalServerErrorException();

    return HttpStatus.OK;
  }

  async updateTopupConfigurations(updateTopupConfigDto: UpdateTopupConfigDto) {
    const { topupAmount, topupThreshold, defaultTopupChannels } =
      updateTopupConfigDto;

    const identity = await this.identityRepository.findOne({
      where: {
        userType: 'SUPER_ADMIN',
      },
    });
    if (!identity) throw new NotFoundException('Identity not found!');

    const latestResult = await this.findLatest();

    if (!latestResult) {
      const systemConfig = await this.systemConfigRepository.save({
        topupAmount,
        topupThreshold,
      });

      return HttpStatus.CREATED;
    }

    delete latestResult.topupAmount;
    delete latestResult.topupThreshold;
    delete latestResult.id;
    delete latestResult.createdAt;
    delete latestResult.updatedAt;

    const newSystemConfig = await this.systemConfigRepository.save({
      topupAmount,
      topupThreshold,
      defaultTopupChannels,
      ...latestResult,
    });

    if (!newSystemConfig) throw new InternalServerErrorException();

    return HttpStatus.OK;
  }

  async updateMemberDefaults(updateMemberDefaultsDto: UpdateMemberDefaultsDto) {
    const {
      payinCommissionRateForMember,
      payoutCommissionRateForMember,
      topupCommissionRateForMember,
      maximumDailyPayoutAmountForMember,
      maximumPayoutAmountForMember,
      minimumPayoutAmountForMember,
    } = updateMemberDefaultsDto;

    const latestResult = await this.findLatest();

    if (!latestResult) {
      await this.systemConfigRepository.save({
        payinCommissionRateForMember,
        payoutCommissionRateForMember,
        topupCommissionRateForMember,
        maximumDailyPayoutAmountForMember,
        maximumPayoutAmountForMember,
        minimumPayoutAmountForMember,
      });
      return HttpStatus.CREATED;
    }

    delete latestResult.payinCommissionRateForMember;
    delete latestResult.payoutCommissionRateForMember;
    delete latestResult.topupCommissionRateForMember;
    delete latestResult.maximumDailyPayoutAmountForMember;
    delete latestResult.maximumPayoutAmountForMember;
    delete latestResult.minimumPayoutAmountForMember;
    delete latestResult.id;
    delete latestResult.createdAt;
    delete latestResult.updatedAt;

    const newSystemConfig = await this.systemConfigRepository.save({
      payinCommissionRateForMember,
      payoutCommissionRateForMember,
      topupCommissionRateForMember,
      maximumDailyPayoutAmountForMember,
      maximumPayoutAmountForMember,
      minimumPayoutAmountForMember,
      ...latestResult,
    });

    if (!newSystemConfig) throw new InternalServerErrorException();

    return HttpStatus.OK;
  }

  async updateMerchantDefaults(
    updateMerchantDefaultsDto: UpdateMerchantDefaultsDto,
  ) {
    const {
      payinServiceRateForMerchant,
      payoutServiceRateForMerchant,
      maximumPayoutAmountForMerchant,
      minimumPayoutAmountForMerchant,
    } = updateMerchantDefaultsDto;

    const latestResult = await this.findLatest();

    if (!latestResult) {
      await this.systemConfigRepository.save({
        payinServiceRateForMerchant,
        payoutServiceRateForMerchant,
        maximumPayoutAmountForMerchant,
        minimumPayoutAmountForMerchant,
      });

      return HttpStatus.CREATED;
    }

    delete latestResult.payinServiceRateForMerchant;
    delete latestResult.payoutServiceRateForMerchant;
    delete latestResult.maximumPayoutAmountForMerchant;
    delete latestResult.maxWithdrawalAmount;
    delete latestResult.minimumPayoutAmountForMerchant;
    delete latestResult.minWithdrawalAmount;
    delete latestResult.withdrawalRate;
    delete latestResult.id;
    delete latestResult.createdAt;
    delete latestResult.updatedAt;

    const newSystemConfig = await this.systemConfigRepository.save({
      payinServiceRateForMerchant,
      payoutServiceRateForMerchant,
      maximumPayoutAmountForMerchant,
      minimumPayoutAmountForMerchant,
      ...latestResult,
    });

    if (!newSystemConfig) throw new InternalServerErrorException();

    return HttpStatus.OK;
  }

  async updateSystemProfit(amount, failed) {
    const systemConfig = await this.findLatest();

    if (!systemConfig) throw new NotFoundException('SystemConfig not found!');

    await this.systemConfigRepository.update(systemConfig.id, {
      systemProfit: systemConfig.systemProfit + amount,
    });

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          userType: UserTypeForTransactionUpdates.SYSTEM_PROFIT,
          pending: true,
        },
        relations: ['identity'],
      });

    for (const entry of transactionUpdateEntries) {
      let beforeValue = systemConfig.systemProfit;
      let afterValue = 0;

      if (entry.userType === UserTypeForTransactionUpdates.SYSTEM_PROFIT)
        afterValue = systemConfig.systemProfit + amount;

      if (failed) afterValue = systemConfig.systemProfit;

      await this.transactionUpdateRepository.update(entry.userType, {
        before: beforeValue,
        after: afterValue,
      });
    }
  }

  async updateWithdrawalDefaults(
    updateWithdrawalDefaultsDto: UpdateWithdrawalDefaultsDto,
  ) {
    const latestResult = await this.findLatest(false);

    if (!latestResult) {
      await this.systemConfigRepository.save(updateWithdrawalDefaultsDto);

      return HttpStatus.OK;
    }
    await this.systemConfigRepository.update(latestResult.id, {
      ...latestResult,
      ...updateWithdrawalDefaultsDto,
    });

    return HttpStatus.OK;
  }
}
