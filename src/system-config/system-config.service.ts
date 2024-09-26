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

import { ChannelService } from 'src/channel/channel.service';
import { Identity } from 'src/identity/entities/identity.entity';

import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateGatewaysTimeoutsDto } from './dto/update-gateways-timeouts.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { UpdateTopupConfigDto } from './dto/update-topup-config.dto';
import { UpdateMemberDefaultsDto } from './dto/update-member-defaults.dto';
import { UpdateMerchantDefaultsDto } from './dto/update-merchant-defaults.dto';
import { Gateway } from 'src/gateway/entities/gateway.entity';
import { plainToInstance } from 'class-transformer';
import { SystemConfigResponseDto } from './dto/system-config-response.dto';

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    @InjectRepository(Gateway)
    private readonly gatewayRepository: Repository<Gateway>,
    private readonly channelService: ChannelService,
  ) {}

  async create(createSystemConfigDto: CreateSystemConfigDto) {
    const {
      defaultTopupChannels,
      defaultPayinGateway,
      defaultPayoutGateway,
      defaultWithdrawalGateway,
      ...remainingSystemConfig
    } = createSystemConfigDto;

    const identity = await this.identityRepository.findOne({
      where: {
        userType: 'SUPER_ADMIN',
      },
    });
    if (!identity) throw new NotFoundException('Identity not found!');

    const payinGateway = await this.gatewayRepository.findOne({
      where: { id: defaultPayinGateway },
    });
    if (!payinGateway)
      throw new NotFoundException('Gateway for payins not found!');

    const payoutGateway = await this.gatewayRepository.findOne({
      where: { id: defaultPayoutGateway },
    });
    if (!payoutGateway)
      throw new NotFoundException('Gateway for payouts not found!');

    const withdrawalGateway = await this.gatewayRepository.findOne({
      where: { id: defaultWithdrawalGateway },
    });
    if (!withdrawalGateway)
      throw new NotFoundException('Gateway for withdrawals not found!');

    const systemConfig = await this.systemConfigRepository.save({
      defaultPayinGateway: payinGateway,
      defaultPayoutGateway: payoutGateway,
      defaultWithdrawalGateway: withdrawalGateway,
      ...remainingSystemConfig,
    });

    if (!systemConfig) throw new InternalServerErrorException();

    await this.channelService.processChannelFilledFields(
      defaultTopupChannels,
      identity,
      systemConfig,
    );

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
      relations: [
        'defaultPayinGateway',
        'defaultPayoutGateway',
        'defaultWithdrawalGateway',
        'defaultTopupChannels',
        'defaultTopupChannels.field',
        'defaultTopupChannels.field.channel',
      ],
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
      const payinGateway = await this.gatewayRepository.findOne({
        where: { id: defaultPayinGateway },
      });
      if (!payinGateway)
        throw new NotFoundException('Gateway for payins not found!');

      const payoutGateway = await this.gatewayRepository.findOne({
        where: { id: defaultPayoutGateway },
      });
      if (!payoutGateway)
        throw new NotFoundException('Gateway for payouts not found!');

      const withdrawalGateway = await this.gatewayRepository.findOne({
        where: { id: defaultWithdrawalGateway },
      });
      if (!withdrawalGateway)
        throw new NotFoundException('Gateway for withdrawals not found!');

      await this.systemConfigRepository.save({
        payinGateway,
        payoutGateway,
        withdrawalGateway,
        payinTimeout,
        payoutTimeout,
      });

      return HttpStatus.CREATED;
    }

    delete latestResult.defaultPayinGateway;
    delete latestResult.defaultPayoutGateway;
    delete latestResult.defaultWithdrawalGateway;
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

      await this.channelService.processChannelFilledFields(
        defaultTopupChannels,
        identity,
        systemConfig,
      );

      return HttpStatus.CREATED;
    }

    delete latestResult.topupAmount;
    delete latestResult.topupThreshold;
    delete latestResult.defaultTopupChannels;
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

    await this.channelService.processChannelFilledFields(
      defaultTopupChannels,
      identity,
      newSystemConfig,
    );

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
      maximumWithdrawalAmountForMerchant,
      minimumPayoutAmountForMerchant,
      minimumWithdrawalAmountForMerchant,
      withdrawalServiceRateForMerchant,
    } = updateMerchantDefaultsDto;

    const latestResult = await this.findLatest();

    if (!latestResult) {
      await this.systemConfigRepository.save({
        payinServiceRateForMerchant,
        payoutServiceRateForMerchant,
        maximumPayoutAmountForMerchant,
        maximumWithdrawalAmountForMerchant,
        minimumPayoutAmountForMerchant,
        minimumWithdrawalAmountForMerchant,
        withdrawalServiceRateForMerchant,
      });

      return HttpStatus.CREATED;
    }

    delete latestResult.payinServiceRateForMerchant;
    delete latestResult.payoutServiceRateForMerchant;
    delete latestResult.maximumPayoutAmountForMerchant;
    delete latestResult.maximumWithdrawalAmountForMerchant;
    delete latestResult.minimumPayoutAmountForMerchant;
    delete latestResult.minimumWithdrawalAmountForMerchant;
    delete latestResult.withdrawalServiceRateForMerchant;
    delete latestResult.id;
    delete latestResult.createdAt;
    delete latestResult.updatedAt;

    const newSystemConfig = await this.systemConfigRepository.save({
      payinServiceRateForMerchant,
      payoutServiceRateForMerchant,
      maximumPayoutAmountForMerchant,
      maximumWithdrawalAmountForMerchant,
      minimumPayoutAmountForMerchant,
      minimumWithdrawalAmountForMerchant,
      withdrawalServiceRateForMerchant,
      ...latestResult,
    });

    if (!newSystemConfig) throw new InternalServerErrorException();

    return HttpStatus.OK;
  }
}
