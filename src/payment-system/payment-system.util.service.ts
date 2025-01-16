import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Member } from 'src/member/entities/member.entity';
import { Phonepe } from './../gateway/entities/phonepe.entity';
import { Razorpay } from 'src/gateway/entities/razorpay.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { ChannelSettings } from 'src/gateway/entities/channel-settings.entity';
import { AmountRangePayinMode } from 'src/merchant/entities/amountRangePayinMode.entity';
import { ProportionalPayinMode } from 'src/merchant/entities/proportionalPayinMode.entity';

import { SystemConfigService } from 'src/system-config/system-config.service';
import { ChannelName, GatewayName, PaymentType } from 'src/utils/enum/enum';

@Injectable()
export class PaymentSystemUtilService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Phonepe)
    private readonly phonePeRepository: Repository<Phonepe>,
    @InjectRepository(Razorpay)
    private readonly razorpayRepository: Repository<Razorpay>,
    @InjectRepository(ChannelSettings)
    private readonly channelSettingsRepository: Repository<ChannelSettings>,
    @InjectRepository(AmountRangePayinMode)
    private readonly amountRangeRepository: Repository<AmountRangePayinMode>,
    @InjectRepository(ProportionalPayinMode)
    private readonly proportionalRepository: Repository<ProportionalPayinMode>,

    private readonly systemConfigService: SystemConfigService,
  ) {}

  async fetchForDefault(merchant, channelName, amount) {
    // If both member and gateway are enabled by the merchant
    if (merchant.allowMemberChannelsPayin && merchant.allowPgBackupForPayin) {
      let selectedMember;
      const startTime = Date.now();
      const payinTimeout =
        (await this.systemConfigService.findLatest()).payinTimeout * 1000;

      // Find an eligible online member with the interval of 0.5 sec until payin timeout
      const intervalId = setInterval(async () => {
        if (Date.now() - startTime >= payinTimeout) {
          clearInterval(intervalId);
          return;
        }

        selectedMember = await this.getMemberForPayin(channelName, amount);
        // If an eligible online member is found clear interval and return the selected member
        if (selectedMember) {
          clearInterval(intervalId);
          return selectedMember;
        }
      }, 500);

      // If no eligible member is found, fetch the gateway
      if (!selectedMember)
        selectedMember = await this.getGatewayForPayin(channelName, amount);

      return selectedMember;
    }

    // If gateway/3rd party payment is disabled by the merchant
    if (!merchant.allowPgBackupForPayin) {
      // Keep finding eligible member with an interval of 0.5 sec indefinitely until found.
      return new Promise((resolve, reject) => {
        const intervalId = setInterval(async () => {
          const selectedMember = await this.getMemberForPayin(
            channelName,
            amount,
          );

          if (selectedMember) {
            clearInterval(intervalId);
            resolve(selectedMember);
          }
        }, 500);
      });
    }

    // If member channels are disabled by the merchant
    if (!merchant.allowMemberChannelsPayin)
      return await this.getGatewayForPayin(channelName, amount);
  }

  async fetchForAmountRange(merchant: Merchant, channelName, payinAmount) {
    const amountRanges = await this.amountRangeRepository.find({
      where: {
        payinMode: {
          merchant: {
            id: merchant.id,
          },
        },
      },
      relations: ['payinMode', 'payinMode.merchant'],
    });

    let selectedGateway;
    for (const range of amountRanges)
      if (payinAmount >= range.lower && payinAmount <= range.upper)
        selectedGateway = range.gateway;

    if (selectedGateway === GatewayName.RAZORPAY) {
      return await this.getGatewayForPayin(
        channelName,
        payinAmount,
        GatewayName.RAZORPAY,
      );
    } else if (selectedGateway === GatewayName.PHONEPE) {
      return await this.getGatewayForPayin(
        channelName,
        payinAmount,
        GatewayName.PHONEPE,
      );
    } else {
      // If no gateway is found then Keep finding the eligible member with an interval of 0.5 sec indefinitely until found.
      const intervalId = setInterval(async () => {
        const selectedMember = await this.getMemberForPayin(
          channelName,
          payinAmount,
        );
        if (selectedMember) {
          clearInterval(intervalId);
          return selectedMember;
        }
      }, 500);
    }
  }

  async fetchForProportional(merchant: Merchant, channelName, amount) {
    const ratios = await this.proportionalRepository.find({
      where: {
        payinMode: {
          merchant: {
            id: merchant.id,
          },
        },
      },
      relations: ['payinMode', 'payinMode.merchant'],
    });

    // Get ratios
    const razorpayRatio = ratios.find(
      (ratio) => ratio.gateway === 'gateway',
    ).ratio;
    const phonepayRatio = ratios.find(
      (ratio) => ratio.gateway === 'phonepay',
    ).ratio;
    const memberRatio = ratios.find(
      (ratio) => ratio.gateway === 'member',
    ).ratio;

    const baseRatio = ratios.reduce((sum, ratio) => sum + ratio.ratio, 0);
    const totalPayins = merchant.payin?.length;
    const totalMemberPayins = merchant.payin.filter(
      (payin) => payin.member,
    ).length;
    const totalRazorpayPayins = merchant.payin.filter(
      (payin) => payin.gatewayName === GatewayName.RAZORPAY,
    ).length;
    const totalPhonepePayins = merchant.payin.filter(
      (payin) => payin.gatewayName === GatewayName.PHONEPE,
    ).length;

    const desiredMemberOrders = Math.round(
      memberRatio * (totalPayins / baseRatio),
    );
    const desiredRazorpayOrders = Math.round(
      razorpayRatio * (totalPayins / baseRatio),
    );
    const desiredPhonepeOrders = Math.round(
      phonepayRatio * (totalPayins / baseRatio),
    );

    const memberDiff = desiredMemberOrders - totalMemberPayins;
    const razorpayDiff = desiredRazorpayOrders - totalRazorpayPayins;
    const phonepeDiff = desiredPhonepeOrders - totalPhonepePayins;

    const diffs = [
      { name: 'member', diff: memberDiff, total: totalMemberPayins },
      { name: 'razorpay', diff: razorpayDiff, total: totalRazorpayPayins },
      { name: 'phonepe', diff: phonepeDiff, total: totalPhonepePayins },
    ];

    const maxDiff = Math.max(memberDiff, razorpayDiff, phonepeDiff);

    const maxDiffOptions = diffs.filter((diff) => diff.diff === maxDiff);

    const selected = maxDiffOptions.reduce((prev, current) => {
      return prev.total < current.total ? prev : current;
    });

    if (selected.name === 'member') {
      const intervalId = setInterval(async () => {
        const selectedMember = await this.getMemberForPayin(
          channelName,
          amount,
        );
        if (selectedMember) {
          clearInterval(intervalId);
          return selectedMember;
        }
      }, 500);
    }

    if (selected.name === 'razorpay')
      return await this.getGatewayForPayin(
        channelName,
        amount,
        GatewayName.RAZORPAY,
      );

    if (selected.name === 'phonepe')
      return await this.getGatewayForPayin(
        channelName,
        amount,
        GatewayName.PHONEPE,
      );
  }

  async getMemberForPayin(channelName, amount) {
    // Eligible members - must have the required channel, must be online and must have quota greater than or equal to the payin order amount.
    const eligibleMembers = await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.identity', 'identity')
      .leftJoinAndSelect('identity.netBanking', 'netBanking')
      .leftJoinAndSelect('identity.eWallet', 'eWallet')
      .leftJoinAndSelect('identity.upi', 'upi')
      .leftJoinAndSelect('member.payin', 'payin')
      .where('member.isOnline = :isOnline', { isOnline: true })
      .andWhere('member.quota >= :amount', { amount })
      .andWhere(`${channelName}.id IS NOT NULL`)
      .getMany();
    if (!eligibleMembers || !eligibleMembers.length) return null;

    // If more than one members are eligible then find the member with least payin orders.
    const memberWithLeastPayinCount = eligibleMembers.reduce((prev, curr) => {
      if (!prev) return curr;
      return prev.payin.length <= curr.payin.length ? prev : curr;
    }, null);

    return memberWithLeastPayinCount;
  }

  async getGatewayForPayin(
    channelName: ChannelName,
    amount,
    priority: GatewayName | null = null, // Passed only in case if payin mode is amount range or proportional
  ) {
    // Priority gateway is assigned if that is passed.
    // If priority gateway is not passed, fetch the gateways priority chain from system config.
    let gatewayPriorityChain = (await this.systemConfigService.findLatest())
      .defaultPayinGateway;

    let selectedGateway = null;
    if (priority) {
      selectedGateway = priority;
    } else {
      // getFirstEnableGateway will return gateway name which is enabled for incoming transactions + the requested/passed channel is also enabled on that gateway.
      selectedGateway = await this.getFirstEnabledGateway(
        gatewayPriorityChain,
        true, // for incoming transactions / payins
        channelName,
      );
    }

    // If no gateway is found then Keep finding the eligible member with an interval of 0.5 sec indefinitely until found.
    if (!selectedGateway) {
      const intervalId = setInterval(async () => {
        const selectedMember = await this.getMemberForPayin(
          channelName,
          amount,
        );
        if (selectedMember) {
          clearInterval(intervalId);
          return selectedMember;
        }
      }, 500);
    }

    return selectedGateway;
  }

  async getFirstEnabledGateway(
    gatewayObject: Record<string, GatewayName>,
    forIncoming: boolean = false, // For payins
    channelName: ChannelName = ChannelName.UPI, // If passed then it will return the gateway name where the passed channel is also enabled.
  ): Promise<GatewayName | null> {
    // Iterates through the gateway priority chain and returns the first gateway name found which is enabled

    const channelMap = {
      upi: ChannelName.UPI,
      netBanking: ChannelName.BANKING,
      eWallet: ChannelName.E_WALLET,
    };

    for (const key in gatewayObject) {
      const gateway = gatewayObject[key];
      let isGatewayEnabled;
      let whereConditions;

      if (forIncoming) {
        whereConditions = {
          incoming: true,
        };
      } else {
        whereConditions = {
          outgoing: true,
        };
      }

      switch (gateway) {
        case GatewayName.PHONEPE:
          isGatewayEnabled = await this.phonePeRepository.findOne({
            where: whereConditions,
          });
          break;

        case GatewayName.RAZORPAY:
          isGatewayEnabled = await this.razorpayRepository.findOne({
            where: whereConditions,
          });
          break;

        case GatewayName.UNIQPAY:
          isGatewayEnabled = false;
          break;

        default:
          break;
      }

      let channelEnabled = null;
      if (forIncoming) {
        channelEnabled = await this.channelSettingsRepository.findOne({
          where: {
            gatewayName: gateway,
            enabled: true,
            channelName: channelMap[channelName],
            type: PaymentType.INCOMING,
          },
        });

        if (channelEnabled) return gateway;
      }

      if (isGatewayEnabled && !forIncoming) return gateway;
    }

    return null;
  }
}
