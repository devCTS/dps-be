import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { SystemConfig } from './entities/system-config.entity';

import { Identity } from 'src/identity/entities/identity.entity';

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
import { systemConfigData } from './data/system-config.data';
import { Upi } from 'src/channel/entity/upi.entity';
import { NetBanking } from 'src/channel/entity/net-banking.entity';
import { EWallet } from 'src/channel/entity/e-wallet.entity';

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    @InjectRepository(Upi)
    private readonly upiRepository: Repository<Upi>,

    @InjectRepository(NetBanking)
    private readonly netBankingRepository: Repository<NetBanking>,

    @InjectRepository(EWallet)
    private readonly eWalletRepository: Repository<EWallet>,
  ) {}

  async create() {
    const identity = await this.identityRepository.findOne({
      where: {
        userType: 'SUPER_ADMIN',
      },
    });
    const createSystemConfigDto = systemConfigData();
    if (!identity) throw new NotFoundException('Identity not found!');
    await this.systemConfigRepository.save(createSystemConfigDto);
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

    const channels = await this.getTopupChannels();

    const {
      defaultPayinGateway,
      defaultPayoutGateway,
      defaultWithdrawalGateway,
    } = latestResult[0];

    return plainToInstance(SystemConfigResponseDto, {
      ...latestResult[0],
      channelProfile: channels,
      defaultPayinGateway: JSON.parse(defaultPayinGateway),
      defaultPayoutGateway: JSON.parse(defaultPayoutGateway),
      defaultWithdrawalGateway: JSON.parse(defaultWithdrawalGateway),
    });
  }

  async findLatest(withRelations: boolean = true) {
    const latestResult = await this.systemConfigRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 1,
    });

    const {
      defaultPayinGateway,
      defaultPayoutGateway,
      defaultWithdrawalGateway,
    } = latestResult[0];

    return {
      ...latestResult[0],
      defaultPayinGateway: JSON.parse(defaultPayinGateway),
      defaultPayoutGateway: JSON.parse(defaultPayoutGateway),
      defaultWithdrawalGateway: JSON.parse(defaultWithdrawalGateway),
    };
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
        defaultPayinGateway: JSON.stringify(defaultPayinGateway),
        defaultPayoutGateway: JSON.stringify(defaultPayoutGateway),
        defaultWithdrawalGateway: JSON.stringify(defaultWithdrawalGateway),
        payinTimeout,
        payoutTimeout,
      });

      return HttpStatus.CREATED;
    }

    delete latestResult.payinTimeout;
    delete latestResult.payoutTimeout;
    delete latestResult.defaultPayinGateway;
    delete latestResult.defaultPayoutGateway;
    delete latestResult.defaultWithdrawalGateway;
    delete latestResult.id;
    delete latestResult.createdAt;
    delete latestResult.updatedAt;

    const newSystemConfig = this.systemConfigRepository.save({
      defaultPayinGateway: JSON.stringify(defaultPayinGateway),
      defaultPayoutGateway: JSON.stringify(defaultPayoutGateway),
      defaultWithdrawalGateway: JSON.stringify(defaultWithdrawalGateway),
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

  async getTopupChannels() {
    const identity = await this.identityRepository.findOne({
      where: {
        email: process.env.SUPER_ADMIN_EMAIL,
      },
      relations: ['upi', 'netBanking', 'eWallet'],
    });

    return {
      upi: identity?.upi || [],
      netBanking: identity?.netBanking || [],
      eWallet: identity?.eWallet || [],
    };
  }

  async updateTopupConfigurations(updateTopupConfigDto: UpdateTopupConfigDto) {
    const { topupAmount, topupThreshold, channelProfile } =
      updateTopupConfigDto;

    const identity = await this.identityRepository.findOne({
      where: {
        userType: 'SUPER_ADMIN',
      },
    });
    if (!identity) throw new NotFoundException('Identity not found!');

    const kgAdmin = await this.identityRepository.findOne({
      where: {
        email: process.env.SUPER_ADMIN_EMAIL,
      },
    });

    if (!kgAdmin) throw new NotFoundException('Kg admin not found.');

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
      ...latestResult,
    });

    await this.upiRepository.delete({
      identity: kgAdmin,
    });
    await this.eWalletRepository.delete({
      identity: kgAdmin,
    });
    await this.netBankingRepository.delete({
      identity: kgAdmin,
    });

    if (channelProfile?.upi && channelProfile.upi.length > 0) {
      for (const element of channelProfile.upi) {
        await this.upiRepository.save({
          ...element,
          identity: kgAdmin,
        });
      }
    }

    if (channelProfile?.eWallet && channelProfile.eWallet.length > 0) {
      for (const element of channelProfile.eWallet) {
        await this.eWalletRepository.save({
          ...element,
          identity: kgAdmin,
        });
      }
    }

    if (channelProfile?.netBanking && channelProfile.netBanking.length > 0) {
      for (const element of channelProfile.netBanking) {
        await this.netBankingRepository.save({
          ...element,
          identity: kgAdmin,
        });
      }
    }

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

  async updateSystemProfit(amount, orderId: string, failed) {
    const systemConfig = await this.findLatest();

    if (!systemConfig) throw new NotFoundException('SystemConfig not found!');

    await this.systemConfigRepository.update(systemConfig.id, {
      systemProfit: systemConfig.systemProfit + amount,
    });

    const updatedSystemConfig = await this.findLatest();

    let whereCondition;
    whereCondition = {
      userType: UserTypeForTransactionUpdates.SYSTEM_PROFIT,
      pending: true,
    };
    if (failed) whereCondition.systemOrderId = orderId;
    else whereCondition.systemOrderId = Not(orderId);

    const systemProfitRows = await this.transactionUpdateRepository.find({
      where: whereCondition,
      relations: ['payinOrder'],
    });

    for (const systemProfitRow of systemProfitRows) {
      let beforeValue = updatedSystemConfig.systemProfit;
      let afterValue = failed ? beforeValue : beforeValue + amount;

      if (failed)
        await this.transactionUpdateRepository.update(systemProfitRow.id, {
          before: beforeValue,
          after: afterValue,
          amount: 0,
        });
      else
        await this.transactionUpdateRepository.update(systemProfitRow.id, {
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
