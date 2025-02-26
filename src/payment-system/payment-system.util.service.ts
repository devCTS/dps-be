import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

import { Member } from 'src/member/entities/member.entity';
import { Phonepe } from './../gateway/entities/phonepe.entity';
import { Razorpay } from 'src/gateway/entities/razorpay.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { ChannelSettings } from 'src/gateway/entities/channel-settings.entity';
import { AmountRangePayinMode } from 'src/merchant/entities/amountRangePayinMode.entity';
import { ProportionalPayinMode } from 'src/merchant/entities/proportionalPayinMode.entity';

import { SystemConfigService } from 'src/system-config/system-config.service';
import {
  ChannelName,
  GatewayName,
  OrderStatus,
  PaymentMadeOn,
  PaymentType,
} from 'src/utils/enum/enum';
import { Payin } from 'src/payin/entities/payin.entity';
import { PayinService } from 'src/payin/payin.service';
import { PaymentSystemService } from './payment-system.service';
import { GetPayPageDto } from './dto/getPayPage.dto';
import { MemberChannelService } from './member/member-channel.service';
import { PhonepeService } from './phonepe/phonepe.service';
import { RazorpayService } from './razorpay/razorpay.service';
import { PayinGateway } from 'src/socket/payin.gateway';
import { PayinSandbox } from 'src/payin/entities/payin-sandbox.entity';
import { Uniqpay } from 'src/gateway/entities/uniqpay.entity';
import { PayuService } from './payu/payu.service';
import { Payu } from 'src/gateway/entities/payu.entity';

@Injectable()
export class PaymentSystemUtilService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Phonepe)
    private readonly phonePeRepository: Repository<Phonepe>,
    @InjectRepository(Razorpay)
    private readonly razorpayRepository: Repository<Razorpay>,
    @InjectRepository(Uniqpay)
    private readonly uniqpayRepository: Repository<Uniqpay>,
    @InjectRepository(Payu)
    private readonly payuRepository: Repository<Payu>,
    @InjectRepository(Payin)
    private readonly payinRepository: Repository<Payin>,
    @InjectRepository(PayinSandbox)
    private readonly payinSandboxRepository: Repository<PayinSandbox>,
    @InjectRepository(ChannelSettings)
    private readonly channelSettingsRepository: Repository<ChannelSettings>,
    @InjectRepository(AmountRangePayinMode)
    private readonly amountRangeRepository: Repository<AmountRangePayinMode>,
    @InjectRepository(ProportionalPayinMode)
    private readonly proportionalRepository: Repository<ProportionalPayinMode>,

    private readonly systemConfigService: SystemConfigService,
    private readonly payinService: PayinService,
    private readonly memberChannelService: MemberChannelService,
    private readonly phonepeService: PhonepeService,
    private readonly razorpayService: RazorpayService,
    private readonly payuService: PayuService,
    private readonly payinGateway: PayinGateway,
  ) {}

  async fetchForDefault(merchant, channelName, amount, disableMember = false) {
    // If both member and gateway are enabled by the merchant
    if (merchant.allowMemberChannelsPayin && merchant.allowPgBackupForPayin) {
      let selectedMember =
        !disableMember &&
        (await this.getMemberWithIntervalCalls({
          channelName,
          amount,
        }));

      if (!selectedMember)
        selectedMember = await this.getGatewayForPayin(channelName, amount);

      return selectedMember;
    }

    // If gateway/3rd party payment is disabled by the merchant
    else if (!merchant.allowPgBackupForPayin) {
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
    else if (!merchant.allowMemberChannelsPayin) {
      return await this.getGatewayForPayin(channelName, amount);
    }
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

    if (selectedGateway?.toUpperCase() === GatewayName.MEMBER) {
      const selectedMember = await this.getMemberWithIntervalCalls({
        channelName,
        amount: payinAmount,
      });
      if (selectedMember) return selectedMember;
    }

    if (selectedGateway?.toUpperCase() === GatewayName.RAZORPAY) {
      const selectedGateway = await this.getGatewayForPayin(
        channelName,
        payinAmount,
        GatewayName.RAZORPAY,
      );

      if (selectedGateway) return selectedGateway;
    }

    if (selectedGateway?.toUpperCase() === GatewayName.PHONEPE) {
      const selectedGateway = await this.getGatewayForPayin(
        channelName,
        payinAmount,
        GatewayName.PHONEPE,
      );

      if (selectedGateway) return selectedGateway;
    }

    const selectedFallbackMethod = await this.fetchForDefault(
      merchant,
      channelName,
      payinAmount,
      true,
    );

    return selectedFallbackMethod;
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
    const razorpayRatio =
      ratios.find((ratio) => ratio.gateway === 'razorpay')?.ratio || 0;
    const phonepayRatio =
      ratios.find((ratio) => ratio.gateway === 'phonepe')?.ratio || 0;
    const memberRatio =
      ratios.find((ratio) => ratio.gateway === 'member')?.ratio || 0;

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

    diffs.sort((a, b) => {
      if (b.diff !== a.diff) return b.diff - a.diff;

      return b.total - a.total;
    });

    for (const element of diffs) {
      if (element.name === 'member') {
        const selectedMember = await this.getMemberWithIntervalCalls({
          channelName,
          amount,
        });

        if (selectedMember) return selectedMember;
      }

      if (element.name === 'razorpay') {
        const selectedGateway = await this.getGatewayForPayin(
          channelName,
          amount,
          GatewayName.RAZORPAY,
        );

        if (selectedGateway) return selectedGateway;
      }

      if (element.name === 'phonepe') {
        const selectedGateway = await this.getGatewayForPayin(
          channelName,
          amount,
          GatewayName.PHONEPE,
        );

        if (selectedGateway) return selectedGateway;
      }
    }
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
      selectedGateway = await this.checkForGatewayAndChannelEnabled(
        priority,
        channelName,
        amount,
        true,
      );
      if (!selectedGateway) return null;
    } else {
      // getFirstEnableGateway will return gateway name which is enabled for incoming transactions + the requested/passed channel is also enabled on that gateway.
      selectedGateway = await this.getFirstEnabledGateway(
        gatewayPriorityChain,
        true, // for incoming transactions / payins
        channelName,
        amount,
      );
    }

    // If no gateway is found then Keep finding the eligible member with an interval of 0.5 sec indefinitely until found.
    // if (!selectedGateway) {
    //   const intervalId = setInterval(async () => {
    //     const selectedMember = await this.getMemberForPayin(
    //       channelName,
    //       amount,
    //     );
    //     if (selectedMember) {
    //       clearInterval(intervalId);
    //       return selectedMember;
    //     }
    //   }, 500);
    // }

    return selectedGateway;
  }

  async checkForGatewayAndChannelEnabled(
    gateway: GatewayName,
    channelName: ChannelName,
    amount,
    forIncoming: boolean,
  ) {
    let isGatewayEnabled;
    let whereConditions;

    const channelMap = {
      upi: ChannelName.UPI,
      netBanking: ChannelName.BANKING,
      eWallet: ChannelName.E_WALLET,
    };

    if (forIncoming)
      whereConditions = {
        incoming: true,
      };
    else
      whereConditions = {
        outgoing: true,
      };

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

      case GatewayName.PAYU:
        isGatewayEnabled = await this.payuRepository.findOne({
          where: whereConditions,
        });
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
          minAmount: LessThanOrEqual(amount),
          maxAmount: MoreThanOrEqual(amount),
        },
      });

      if (channelEnabled && isGatewayEnabled) return gateway;
    }

    if (isGatewayEnabled && !forIncoming) return gateway;

    return null;
  }

  async getFirstEnabledGateway(
    gatewayObject: Record<string, GatewayName>,
    forIncoming: boolean = false, // For payins
    channelName: ChannelName = ChannelName.UPI, // If passed then it will return the gateway name where the passed channel is also enabled.
    amount = 0,
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
          isGatewayEnabled = await this.uniqpayRepository.findOne({
            where: whereConditions,
          });
          break;

        case GatewayName.PAYU:
          isGatewayEnabled = await this.payuRepository.findOne({
            where: whereConditions,
          });
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
            minAmount: LessThanOrEqual(amount),
            maxAmount: MoreThanOrEqual(amount),
          },
        });

        if (channelEnabled && isGatewayEnabled) return gateway;
      }

      if (isGatewayEnabled && !forIncoming) return gateway;
    }

    return null;
  }

  async assignPaymentMethodForPayinOrder(
    merchant: Merchant,
    createdPayin: Payin,
    userId,
    environment,
  ) {
    let channelNameMap = {
      UPI: 'upi',
      NET_BANKING: 'netBanking',
      E_WALLET: 'eWallet',
    };
    let channelName = channelNameMap[createdPayin.channel];

    let selectedPaymentMode;
    switch (merchant.payinMode) {
      case 'DEFAULT':
        selectedPaymentMode = await this.fetchForDefault(
          merchant,
          channelName,
          createdPayin.amount,
        );
        break;

      case 'AMOUNT RANGE':
        selectedPaymentMode = await this.fetchForAmountRange(
          merchant,
          channelName,
          createdPayin.amount,
        );
        break;

      case 'PROPORTIONAL':
        selectedPaymentMode = await this.fetchForProportional(
          merchant,
          channelName,
          createdPayin.amount,
        );
        break;

      default:
        break;
    }

    if (!selectedPaymentMode) return;

    const isMember = !!selectedPaymentMode?.id;
    let paymentDetails;

    if (isMember) {
      paymentDetails = selectedPaymentMode.identity[channelName];
    } else {
      paymentDetails = await this.channelSettingsRepository.findOne({
        where: {
          gatewayName: selectedPaymentMode,
          type: PaymentType.INCOMING,
          channelName: createdPayin.channel,
        },
      });
    }

    const body = {
      id: createdPayin.systemOrderId,
      paymentMode: isMember ? PaymentMadeOn.MEMBER : PaymentMadeOn.GATEWAY,
      memberId: isMember && selectedPaymentMode.id,
      gatewayServiceRate: !isMember ? paymentDetails.upstreamFee : null,
      memberPaymentDetails: isMember ? paymentDetails[0] : null,
      gatewayName: !isMember ? selectedPaymentMode : null,
      userId: userId,
    };

    await this.payinService.updatePayinStatusToAssigned(body);

    let res = null;
    if (isMember)
      res = await this.getPayPage({
        orderId: createdPayin.systemOrderId,
        gateway: GatewayName.MEMBER,
      });

    if (selectedPaymentMode === GatewayName.PHONEPE)
      res = await this.getPayPage({
        userId: createdPayin.user?.userId,
        amount: createdPayin.amount.toString(),
        orderId: createdPayin.systemOrderId,
        gateway: GatewayName.PHONEPE,
        integrationId: merchant.integrationId,
        channelName: createdPayin.channel,
        environment,
      });

    if (selectedPaymentMode === GatewayName.RAZORPAY)
      res = await this.getPayPage({
        userId: createdPayin.user?.userId,
        amount: createdPayin.amount.toString(),
        orderId: createdPayin.systemOrderId,
        gateway: GatewayName.RAZORPAY,
        integrationId: merchant.integrationId,
        channelName: createdPayin.channel,
        environment,
      });

    if (selectedPaymentMode === GatewayName.PAYU)
      res = await this.getPayPage({
        userId: createdPayin.user?.userId,
        amount: createdPayin.amount.toString(),
        orderId: createdPayin.systemOrderId,
        gateway: GatewayName.PAYU,
        integrationId: merchant.integrationId,
        channelName: createdPayin.channel,
        environment,
      });

    await this.payinRepository.update(createdPayin.id, {
      trackingId: res.trackingId,
    });

    const paymentMethodType = isMember ? 'MEMBER' : 'GATEWAY';

    setTimeout(() => {
      this.payinGateway.notifyOrderAssigned(
        createdPayin.systemOrderId,
        res.url,
        paymentMethodType,
        selectedPaymentMode,
      );
    }, 1000);
  }

  async getPayPage(getPayPageDto: GetPayPageDto) {
    const { gateway, orderId } = getPayPageDto;

    if (gateway === GatewayName.MEMBER)
      return await this.memberChannelService.getPayPage(orderId);

    if (gateway === GatewayName.PHONEPE)
      return await this.phonepeService.getPayPage(getPayPageDto);

    if (gateway === GatewayName.RAZORPAY)
      return await this.razorpayService.getPayPage(getPayPageDto);

    if (gateway === GatewayName.PAYU)
      return await this.payuService.getPayPage(getPayPageDto);
  }

  async processPaymentMethodSandbox(
    merchant: Merchant,
    createdPayin: PayinSandbox,
    paymentMethod: 'member' | 'phonepe' | 'razorpay' | 'payu',
    userId: string,
    environment: 'live' | 'sandbox',
  ) {
    let gatewayName;
    if (paymentMethod === 'member') gatewayName = GatewayName.MEMBER;
    if (paymentMethod === 'phonepe') gatewayName = GatewayName.PHONEPE;
    if (paymentMethod === 'razorpay') gatewayName = GatewayName.RAZORPAY;
    if (paymentMethod === 'payu') gatewayName = GatewayName.PAYU;

    try {
      const res: any = await this.getPayPage({
        orderId: createdPayin.systemOrderId,
        userId: userId,
        amount: createdPayin.amount.toString(),
        gateway: gatewayName,
        channelName: createdPayin.channel,
        integrationId: merchant.integrationId,
        environment,
      });

      if (gatewayName !== GatewayName.MEMBER)
        await this.payinSandboxRepository.update(createdPayin.id, {
          trackingId: res?.trackingId,
        });

      const paymentMethodType =
        gatewayName === GatewayName.MEMBER ? 'MEMBER' : 'GATEWAY';

      setTimeout(() => {
        this.payinGateway.notifyOrderAssigned(
          createdPayin.systemOrderId,
          res?.url,
          paymentMethodType,
          gatewayName,
        );
      }, 1000);
    } catch (e) {
      console.log(e);
    }
  }

  async getMemberWithIntervalCalls({ channelName, amount }) {
    let selectedMember;
    const startTime = Date.now();
    const payinTimeout =
      (await this.systemConfigService.findLatest()).payinTimeout * 1000;

    // Find an eligible online member with the interval of 0.5 sec until payin timeout
    const findMemberPromise = new Promise((resolve, reject) => {
      const intervalId = setInterval(async () => {
        if (Date.now() - startTime >= payinTimeout) {
          clearInterval(intervalId);
          resolve(null); // No member found within the timeout
        }

        selectedMember = await this.getMemberForPayin(channelName, amount);
        // If an eligible online member is found, clear interval and resolve the promise
        if (selectedMember) {
          clearInterval(intervalId);
          resolve(selectedMember);
        }
      }, 500);
    });

    // Await the result of finding a member
    selectedMember = await findMemberPromise;
    return selectedMember;
  }
}
